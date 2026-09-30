import { useCallback, useEffect, useRef, useState } from "react";
import type { CompanyEvent, FounderCommandResult } from "@/types/company";
import type { OfficeEmployee, VirtualOfficeState } from "@/types/office";
import { animationFor, poseFor, ROOMS, ROSTER } from "@/lib/company/layout";
import { reduceEmployees, shouldAcceptSnapshot, type SyncCursor } from "@/lib/company/sync";
import { FOUNDER_ID } from "@/lib/company/world";
import { useCompanyEvents } from "./useCompanyEvents";

function fallbackState(): VirtualOfficeState {
  const employees: OfficeEmployee[] = ROSTER.map((person) => {
    const status = person.id === "emma" ? "review" : person.id === "alexander" ? "idle" : "working";
    const pose = poseFor(person.id, status);
    return {
      id: person.id,
      name: person.name,
      role: person.role,
      department: person.department,
      status,
      current_task: null,
      skills: person.skills,
      room_id: person.room_id,
      position: pose.position,
      facing: pose.facing,
      animation: animationFor(person.name, status, false),
    };
  });
  return { epoch: 0, seq: 0, office: { rooms: ROOMS }, employees };
}

export function useVirtualOffice() {
  const [state, setState] = useState<VirtualOfficeState>(() => fallbackState());
  const [feed, setFeed] = useState<CompanyEvent[]>([]);
  const [commandResult, setCommandResult] = useState<FounderCommandResult | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const cursorRef = useRef<SyncCursor>({ epoch: 0, seq: 0 });
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    let response: Response;
    try {
      response = await fetch("/api/v1/virtual-office/state", { cache: "no-store" });
    } catch {
      setLinkError("Floor link interrupted. Showing the last confirmed snapshot.");
      return;
    }
    if (requestId !== requestRef.current) return;
    if (!response.ok) {
      setLinkError("Floor snapshot unavailable. Retrying from the last good state.");
      return;
    }
    let body: VirtualOfficeState;
    try {
      body = (await response.json()) as VirtualOfficeState;
    } catch {
      setLinkError("Floor snapshot was unreadable. Keeping the current floor.");
      return;
    }
    if (!body?.office || !Array.isArray(body.employees)) {
      setLinkError("Floor snapshot was incomplete. Keeping the current floor.");
      return;
    }
    const decision = shouldAcceptSnapshot(
      cursorRef.current,
      { epoch: Number(body.epoch ?? 0), seq: Number(body.seq ?? 0) },
      requestId,
      requestRef.current,
    );
    if (decision === "reject-stale" || decision === "reject-superseded") return;
    const nextEpoch = Number(body.epoch ?? 0);
    const nextSeq = Number(body.seq ?? 0);
    cursorRef.current = { epoch: nextEpoch, seq: nextSeq };
    setLinkError(null);
    setState({ ...body, epoch: nextEpoch, seq: nextSeq, office: { rooms: body.office.rooms ?? ROOMS } });
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const connected = useCompanyEvents((event) => {
    const cursor = cursorRef.current;
    if (event.epoch && cursor.epoch && event.epoch !== cursor.epoch) return;
    if (event.seq > cursor.seq) {
      cursorRef.current = { epoch: event.epoch || cursor.epoch, seq: event.seq };
    }
    setFeed((current) => [event, ...current].slice(0, 8));
    setState((current) => ({
      ...current,
      seq: Math.max(current.seq, event.seq),
      employees: reduceEmployees(current.employees, event),
    }));
    if (event.type === "project_phase_changed" || event.type === "meeting_started") {
      void refresh();
    }
  }, cursorRef);

  const sendCommand = useCallback(
    async (command: string) => {
      setCommandError(null);
      let response: Response;
      try {
        response = await fetch("/api/v1/founder/command", {
          method: "POST",
          headers: { "content-type": "application/json", "x-founder-id": FOUNDER_ID },
          body: JSON.stringify({ command }),
        });
      } catch {
        setCommandError("The company could not be reached. Nothing was changed.");
        return;
      }
      if (!response.ok) {
        setCommandError("Alexander could not record that command.");
        return;
      }
      try {
        const body = (await response.json()) as FounderCommandResult;
        setCommandResult(body);
      } catch {
        setCommandError("Alexander answered, but the plan could not be read.");
      }
      await refresh();
    },
    [refresh],
  );

  return { state, feed, connected, commandResult, commandError, linkError, sendCommand, refresh };
}
