import type {
  Activity,
  CompanyEvent,
  CompanyStatus,
  Employee,
  EmployeeStatus,
  FounderCommandResult,
  Project,
  Task,
} from "@/types/company";
import type { OfficeEmployee, VirtualOfficeState } from "@/types/office";
import { ROOMS, ROSTER, animationFor, poseFor } from "./layout.ts";

export const PHASE_MS = 12_000;
export const FOUNDER_ID = "00000000-0000-4000-8000-000000000001";

type Beat = { status: EmployeeStatus; task: string };

const SCRIPTS: Record<string, Beat[]> = {
  alexander: [
    { status: "idle", task: "Available for founder direction" },
    { status: "meeting", task: "Hosting the floor sync" },
    { status: "working", task: "Drafting company priorities" },
    { status: "review", task: "Reading the morning brief" },
  ],
  marcus: [
    { status: "working", task: "Reviewing service boundaries" },
    { status: "meeting", task: "Architecture sync" },
    { status: "review", task: "Reading the technical plan" },
    { status: "working", task: "Updating the system map" },
  ],
  olivia: [
    { status: "working", task: "Writing product requirements" },
    { status: "meeting", task: "Scoping the next slice" },
    { status: "working", task: "Ordering the user stories" },
    { status: "review", task: "Checking the requirement draft" },
  ],
  sophia: [
    { status: "working", task: "Composing the design system" },
    { status: "meeting", task: "Design critique" },
    { status: "working", task: "Refining the interface frames" },
    { status: "idle", task: "Waiting on the next brief" },
  ],
  david: [
    { status: "working", task: "Implementing the delivery surface" },
    { status: "meeting", task: "Implementation sync" },
    { status: "working", task: "Wiring the company monitors" },
    { status: "assigned", task: "Picking up the next engineering task" },
  ],
  emma: [
    { status: "review", task: "Reviewing quality gates" },
    { status: "meeting", task: "QA sync" },
    { status: "failed", task: "Regression on the delivery gate" },
    { status: "working", task: "Re-running the quality checklist" },
  ],
};

const PROJECT_PHASE = ["development", "testing", "development", "planning"] as const;

type Override = { status: EmployeeStatus; task: string; until: number; then?: Beat & { until: number } };

export type World = {
  epoch: number;
  seq: number;
  applied: Record<string, EmployeeStatus>;
  overrides: Record<string, Override | undefined>;
  meetingKey: string;
  projects: Project[];
  tasks: Task[];
  activity: Activity[];
  events: CompanyEvent[];
  phase: number;
  /** True while a founder override is holding the active project phase. */
  phaseHeld: boolean;
};

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function stamp(now: number): string {
  return new Date(now).toISOString();
}

function pushEvent(world: World, now: number, type: CompanyEvent["type"], data: Record<string, unknown>): CompanyEvent {
  world.seq += 1;
  const event: CompanyEvent = {
    id: uid("evt"),
    seq: world.seq,
    epoch: world.epoch,
    type,
    occurred_at: stamp(now),
    data,
  };
  world.events.push(event);
  if (world.events.length > 80) world.events.splice(0, world.events.length - 80);
  return event;
}

function log(world: World, now: number, event: string, description: string) {
  world.activity.unshift({ id: uid("act"), event, description, timestamp: stamp(now) });
  if (world.activity.length > 40) world.activity.pop();
}

export function createWorld(now: number): World {
  const world: World = {
    epoch: now,
    seq: 0,
    applied: {},
    overrides: {},
    meetingKey: "",
    projects: [
      {
        id: "proj-command-surface",
        name: "Founder Command Surface",
        status: "development",
        progress: 46,
        created_at: stamp(now),
      },
    ],
    tasks: [],
    activity: [],
    events: [],
    phase: 0,
    phaseHeld: false,
  };
  for (const person of ROSTER) {
    const beat = beatFor(world, person.id, now);
    world.applied[person.id] = beat.status;
    world.tasks.push({
      id: `task-${person.id}`,
      title: beat.task,
      status: taskStatusFor(beat.status),
      priority: person.id === "alexander" ? "high" : "medium",
      progress: person.id === "emma" ? 62 : 40,
      assigned_employee: person.name,
      project_id: world.projects[0]!.id,
    });
  }
  log(world, now, "company_online", "Company floor is live. Alexander is in the CEO room.");
  return world;
}

function phaseIndex(world: World, now: number): number {
  const elapsed = Math.max(0, now - world.epoch);
  return Math.floor(elapsed / PHASE_MS) % SCRIPTS.alexander!.length;
}

/** Active founder override, or null once the chain has expired. */
export function activeOverride(world: World, id: string, now: number): Beat | null {
  const override = world.overrides[id];
  if (!override) return null;
  if (now < override.until) return { status: override.status, task: override.task };
  if (override.then && now < override.then.until) return { status: override.then.status, task: override.then.task };
  return null;
}

/** Drop overrides whose entire lifecycle has elapsed. Returns removed ids. */
export function cleanupOverrides(world: World, now: number): string[] {
  const removed: string[] = [];
  for (const id of Object.keys(world.overrides)) {
    if (activeOverride(world, id, now)) continue;
    delete world.overrides[id];
    removed.push(id);
  }
  return removed;
}

function beatFor(world: World, id: string, now: number): Beat {
  return activeOverride(world, id, now) ?? SCRIPTS[id]![phaseIndex(world, now)]!;
}

function taskStatusFor(status: EmployeeStatus): string {
  if (status === "review") return "review";
  if (status === "failed") return "blocked";
  if (status === "completed") return "done";
  if (status === "assigned") return "assigned";
  if (status === "idle") return "todo";
  return "in_progress";
}

function currentTask(world: World, name: string): Task | undefined {
  const projectId = world.projects[0]?.id;
  return (
    world.tasks.find((item) => item.assigned_employee === name && item.project_id === projectId) ??
    world.tasks.find((item) => item.assigned_employee === name)
  );
}

function syncAssignment(world: World, person: (typeof ROSTER)[number], beat: Beat, statusChanged: boolean) {
  const task = currentTask(world, person.name);
  if (!task) return;
  task.title = beat.task;
  task.assigned_employee = person.name;
  task.status = taskStatusFor(beat.status);
  if (!statusChanged) return;
  if (beat.status === "completed") task.progress = 100;
  else if (beat.status !== "failed") task.progress = Math.min(95, task.progress + 4);
}

export function snapshotEmployees(world: World, now: number): Employee[] {
  return ROSTER.map((person) => {
    const beat = beatFor(world, person.id, now);
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
      status: beat.status,
      current_task: beat.task,
      skills: person.skills,
    };
  });
}

export function officeState(world: World, now: number): VirtualOfficeState {
  const employees: OfficeEmployee[] = snapshotEmployees(world, now).map((employee) => {
    const pose = poseFor(employee.id, employee.status);
    return {
      ...employee,
      room_id: ROSTER.find((person) => person.id === employee.id)?.room_id ?? "meeting",
      position: pose.position,
      facing: pose.facing,
      animation: animationFor(employee.name, employee.status, false),
    };
  });
  return { epoch: world.epoch, seq: world.seq, office: { rooms: ROOMS }, employees };
}

export function companyStatus(world: World, now: number): CompanyStatus {
  const employees = snapshotEmployees(world, now);
  const activeTasks = employees.filter((employee) =>
    ["assigned", "working", "review", "meeting"].includes(employee.status),
  ).length;
  return {
    employees_total: employees.length,
    projects_total: world.projects.length,
    active_projects: world.projects.filter((project) => project.status !== "completed").length,
    active_tasks: activeTasks,
    activities_today: world.activity.length,
    system_status: "online",
  };
}

export function tickWorld(world: World, now: number): CompanyEvent[] {
  const before = world.events.length;
  const removed = cleanupOverrides(world, now);
  const phase = phaseIndex(world, now);
  const phaseChanged = phase !== world.phase;
  world.phase = phase;
  const alexanderHeld = activeOverride(world, "alexander", now) != null;
  const released = world.phaseHeld || removed.includes("alexander");
  if (alexanderHeld) {
    world.phaseHeld = true;
  } else {
    world.phaseHeld = false;
    const project = world.projects[0];
    if (project && (phaseChanged || released)) {
      const next = PROJECT_PHASE[phase] ?? "development";
      if (project.status !== next) {
        project.status = next;
        project.progress = Math.min(96, project.progress + 8);
        pushEvent(world, now, "project_phase_changed", {
          project_id: project.id,
          name: project.name,
          phase: next,
          status: next,
        });
        log(world, now, "project_phase_changed", `${project.name} moved to ${next}.`);
      }
    }
  }

  const meetingIds: string[] = [];
  for (const person of ROSTER) {
    const beat = beatFor(world, person.id, now);
    const previous = world.applied[person.id];
    const statusChanged = previous !== beat.status;
    syncAssignment(world, person, beat, statusChanged);
    if (!statusChanged) {
      if (beat.status === "meeting") meetingIds.push(person.id);
      continue;
    }
    world.applied[person.id] = beat.status;
    pushEvent(world, now, "employee_status_changed", {
      employee_id: person.id,
      name: person.name,
      status: beat.status,
      current_task: beat.task,
    });
    log(world, now, "employee_status_changed", `${person.name} is now ${beat.status}.`);
    if (beat.status === "assigned") {
      pushEvent(world, now, "task_assigned", {
        employee_id: person.id,
        name: person.name,
        task: beat.task,
      });
      log(world, now, "task_assigned", `${person.name} assigned: ${beat.task}.`);
    }
    if (beat.status === "completed") {
      pushEvent(world, now, "task_completed", { employee_id: person.id, name: person.name, task: beat.task });
      log(world, now, "task_completed", `${person.name} completed ${beat.task}.`);
    }
    if (beat.status === "meeting") meetingIds.push(person.id);
  }

  const meetingKey = meetingIds.slice().sort().join(",");
  if (meetingIds.length >= 2 && meetingKey !== world.meetingKey) {
    world.meetingKey = meetingKey;
    pushEvent(world, now, "meeting_started", {
      employee_ids: meetingIds,
      topic: "Floor sync",
      room_id: "meeting",
    });
    log(world, now, "meeting_started", "A floor sync started in the meeting room.");
  }
  if (meetingIds.length < 2) world.meetingKey = "";

  return world.events.slice(before);
}

const ASSIGNMENTS: { owner: string; title: string }[] = [
  { owner: "alexander", title: "Company Strategy" },
  { owner: "marcus", title: "Technical Architecture" },
  { owner: "olivia", title: "Product Requirements" },
  { owner: "sophia", title: "Design Planning" },
  { owner: "david", title: "Development Planning" },
  { owner: "emma", title: "Testing Planning" },
];

export function commandWorld(world: World, command: string, now: number): FounderCommandResult {
  const cleaned = command.trim().replace(/^buat\s+/i, "").trim();
  const name = (cleaned || "New Initiative").replace(/\s+/g, " ");
  const titled = name.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const project: Project = {
    id: uid("proj"),
    name: titled,
    status: "planning",
    progress: 8,
    created_at: stamp(now),
  };
  world.projects.unshift(project);
  world.phaseHeld = true;

  const tasks = ASSIGNMENTS.map((plan) => {
    const person = ROSTER.find((entry) => entry.id === plan.owner)!;
    const title = `${plan.title}: ${titled}`;
    world.tasks.unshift({
      id: uid("task"),
      title,
      status: plan.owner === "alexander" ? "in_progress" : "assigned",
      priority: "high",
      progress: plan.owner === "alexander" ? 8 : 0,
      assigned_employee: person.name,
      project_id: project.id,
    });
    if (plan.owner === "alexander") {
      world.overrides[person.id] = { status: "working", task: title, until: now + 36_000 };
    } else {
      world.overrides[person.id] = {
        status: "assigned",
        task: title,
        until: now + 7_000,
        then: { status: "working", task: title, until: now + 36_000 },
      };
    }
    return {
      title,
      description: "Initial planning task",
      priority: "high",
      assigned_employee: person.name,
    };
  });

  tickWorld(world, now);
  pushEvent(world, now, "project_phase_changed", {
    project_id: project.id,
    name: project.name,
    phase: "planning",
    status: "planning",
  });
  log(world, now, "ceo_created_project", `Alexander created project ${titled}.`);

  return {
    project: titled,
    strategy: {
      project_name: titled,
      objective: command.trim() || titled,
      target_user: "Founder-defined target users",
      features: ["Core workflow", "Conversion flow", "Contact/support"],
      departments_required: ["Product", "Design", "Technology", "Quality Assurance"],
      priority: "high",
      risk: "Requirements require Founder validation.",
      timeline: "4 weeks",
    },
    tasks,
    status: "planning",
  };
}

export function eventsSince(world: World, since: number): CompanyEvent[] {
  return world.events.filter((event) => event.seq > since);
}
