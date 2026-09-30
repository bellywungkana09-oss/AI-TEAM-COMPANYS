import { useEffect, useRef, useState } from "react";
import type { CompanyEvent } from "@/types/company";
import { createEventGate, type SyncCursor } from "@/lib/company/sync";

/**
 * Event stream is a fast path only.
 * The caller owns the snapshot cursor; events from an older epoch or a seq
 * already covered by the snapshot are ignored. Invalid payloads never apply.
 */
export function useCompanyEvents(
  onEvent: (event: CompanyEvent) => void,
  cursorRef: { current: SyncCursor },
) {
  const [connected, setConnected] = useState(false);
  const handler = useRef(onEvent);
  handler.current = onEvent;
  const cursor = useRef(cursorRef);
  cursor.current = cursorRef;

  useEffect(() => {
    let stopped = false;
    let since = 0;
    let socket: WebSocket | null = null;
    let retry = 0;
    let attempts = 0;
    const gate = createEventGate();

    const take = (input: unknown) => {
      const current = cursor.current.current;
      gate.noteEpoch(current.epoch);
      const decision = gate.consider(input);
      if (decision === "invalid" || decision === "duplicate" || decision === "stale-epoch") return;
      const event = input as CompanyEvent;
      if (event.seq > 0) since = Math.max(since, event.seq);
      if (event.epoch && current.epoch && event.epoch !== current.epoch) return;
      if (event.seq > 0 && current.epoch && event.epoch === current.epoch && event.seq <= current.seq) return;
      if (decision === "hello") {
        setConnected(true);
        return;
      }
      handler.current(event);
    };

    const poll = async () => {
      try {
        const response = await fetch(`/api/v1/company/events?since=${since}`, { cache: "no-store" });
        if (!response.ok) {
          setConnected(false);
          return;
        }
        const body = (await response.json()) as { events?: unknown };
        if (!body || !Array.isArray(body.events)) return;
        setConnected(true);
        attempts = 0;
        for (const event of body.events) take(event);
      } catch {
        setConnected(false);
      }
    };

    const connect = () => {
      if (stopped) return;
      if (typeof WebSocket === "undefined") return;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      try {
        socket = new WebSocket(`${protocol}://${window.location.host}/ws/company`);
      } catch {
        setConnected(false);
        return;
      }
      socket.onopen = () => setConnected(true);
      socket.onmessage = (message) => {
        try {
          take(JSON.parse(String(message.data)) as unknown);
        } catch {
          /* malformed frame — ignore */
        }
      };
      socket.onerror = () => {
        /* Polling remains the recovery path when the socket is absent. */
      };
      socket.onclose = () => {
        if (stopped) return;
        attempts += 1;
        const delay = Math.min(12_000, 1500 * Math.max(1, attempts));
        retry = window.setTimeout(connect, delay);
      };
    };

    void poll();
    const timer = window.setInterval(() => void poll(), 1200);
    connect();
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.clearTimeout(retry);
      socket?.close();
    };
  }, []);

  return connected;
}
