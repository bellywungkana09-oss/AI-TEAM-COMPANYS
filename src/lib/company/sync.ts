import type { CompanyEvent, EmployeeStatus } from "@/types/company";
import type { OfficeEmployee } from "@/types/office";
import { animationFor, poseFor, ROSTER } from "./layout.ts";

export const KNOWN_EMPLOYEES = new Set(ROSTER.map((person) => person.id));

export const VALID_STATUSES = new Set<EmployeeStatus>([
  "idle",
  "assigned",
  "working",
  "meeting",
  "review",
  "completed",
  "failed",
]);

export const TRACKED_EVENTS = new Set([
  "employee_status_changed",
  "task_assigned",
  "task_completed",
  "meeting_started",
  "project_phase_changed",
  "company_status_changed",
]);

export type SyncCursor = { epoch: number; seq: number };

export type SnapshotDecision = "accept" | "reset" | "reject-stale" | "reject-superseded";

/**
 * Snapshot is the source of truth.
 * A newer in-flight request wins over an older one.
 * Same epoch + lower seq is stale (events or a newer snapshot already moved the cursor).
 * A higher epoch is a server restart and replaces local state.
 * A lower epoch after we have locked one is an in-flight response from before the restart.
 */
export function shouldAcceptSnapshot(
  cursor: SyncCursor,
  incoming: { epoch: number; seq: number },
  requestId: number,
  latestRequestId: number,
): SnapshotDecision {
  if (!Number.isFinite(incoming.epoch) || !Number.isFinite(incoming.seq)) return "reject-stale";
  if (requestId !== latestRequestId) return "reject-superseded";
  if (cursor.epoch === 0) return "accept";
  if (incoming.epoch !== cursor.epoch) {
    if (incoming.epoch < cursor.epoch) return "reject-stale";
    return "reset";
  }
  if (incoming.seq < cursor.seq) return "reject-stale";
  return "accept";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function validateCompanyEvent(input: unknown): CompanyEvent | null {
  if (!isRecord(input)) return null;
  const type = input.type;
  const seq = input.seq;
  if (typeof type !== "string" || !TRACKED_EVENTS.has(type)) return null;
  if (typeof seq !== "number" || !Number.isFinite(seq)) return null;
  if (input.epoch != null && (typeof input.epoch !== "number" || !Number.isFinite(input.epoch))) return null;
  const data = input.data;
  if (!isRecord(data)) return null;

  if (type === "company_status_changed" || type === "project_phase_changed") {
    return input as CompanyEvent;
  }

  if (type === "meeting_started") {
    const ids = data.employee_ids;
    if (!Array.isArray(ids) || ids.length === 0) return null;
    if (ids.some((id) => typeof id !== "string" || !KNOWN_EMPLOYEES.has(id))) return null;
    return input as CompanyEvent;
  }

  const employeeId = data.employee_id;
  if (typeof employeeId !== "string" || !KNOWN_EMPLOYEES.has(employeeId)) return null;

  if (type === "employee_status_changed") {
    if (typeof data.status !== "string" || !VALID_STATUSES.has(data.status as EmployeeStatus)) return null;
    if (data.current_task != null && typeof data.current_task !== "string") return null;
  } else if (data.task != null && typeof data.task !== "string") {
    return null;
  }

  return input as CompanyEvent;
}

export type GateResult = "apply" | "duplicate" | "invalid" | "stale-epoch" | "hello";

export function createEventGate() {
  let epoch = 0;
  const seen = new Set<number>();

  return {
    noteEpoch(next: number) {
      if (!Number.isFinite(next) || next === epoch) return;
      epoch = next;
      seen.clear();
    },
    epoch() {
      return epoch;
    },
    consider(input: unknown): GateResult {
      const event = validateCompanyEvent(input);
      if (!event) return "invalid";
      if (event.epoch && epoch && event.epoch < epoch) return "stale-epoch";
      if (event.epoch && event.epoch !== epoch) {
        epoch = event.epoch;
        seen.clear();
      }
      if (event.type === "company_status_changed") return "hello";
      if (event.seq > 0) {
        if (seen.has(event.seq)) return "duplicate";
        seen.add(event.seq);
        if (seen.size > 400) {
          const keep = [...seen].sort((a, b) => a - b).slice(-200);
          seen.clear();
          for (const value of keep) seen.add(value);
        }
      }
      return "apply";
    },
  };
}

function paint(employee: OfficeEmployee, status: EmployeeStatus, task: string | null): OfficeEmployee {
  const pose = poseFor(employee.id, status);
  return {
    ...employee,
    status,
    current_task: task,
    position: pose.position,
    facing: pose.facing,
    animation: animationFor(employee.name, status, false),
  };
}

/** Apply one validated event. Invalid input returns the list unchanged. */
export function reduceEmployees(employees: OfficeEmployee[], input: unknown): OfficeEmployee[] {
  const event = validateCompanyEvent(input);
  if (!event || event.type === "company_status_changed" || event.type === "project_phase_changed") return employees;

  if (event.type === "meeting_started") {
    const ids = new Set((event.data.employee_ids as string[]) ?? []);
    const topic = typeof event.data.topic === "string" ? event.data.topic : "Floor sync";
    return employees.map((employee) => (ids.has(employee.id) ? paint(employee, "meeting", topic) : employee));
  }

  const id = String(event.data.employee_id ?? "");
  return employees.map((employee) => {
    if (employee.id !== id) return employee;
    if (event.type === "employee_status_changed") {
      const status = event.data.status as EmployeeStatus;
      const task = typeof event.data.current_task === "string" ? event.data.current_task : employee.current_task;
      return paint(employee, status, task);
    }
    if (event.type === "task_assigned") {
      const task = typeof event.data.task === "string" ? event.data.task : employee.current_task;
      return paint(employee, "assigned", task);
    }
    if (event.type === "task_completed") {
      const task = typeof event.data.task === "string" ? event.data.task : employee.current_task;
      return paint(employee, "completed", task);
    }
    return employee;
  });
}
