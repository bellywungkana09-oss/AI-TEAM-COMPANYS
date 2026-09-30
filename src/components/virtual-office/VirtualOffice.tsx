import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { MotionConfig, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ROOMS, visitPoint } from "@/lib/company/layout";
import { useFounderPose } from "@/lib/company/founder-store";
import { useVirtualOffice } from "@/hooks/useVirtualOffice";
import type { FloorControl } from "./CameraController";
import { OfficeScene } from "./OfficeScene";
import { InteractionPanel } from "./InteractionPanel";
import { CommandComposer } from "@/components/command-center/CommandComposer";

export function VirtualOffice() {
  const office = useVirtualOffice();
  const control = useRef<FloorControl>({
    playing: false,
    touch: { steer: 0, throttle: 0 },
    autopilot: null,
  }).current;
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  const employees = office.state.employees;
  const selected = employees.find((employee) => employee.id === selectedId) ?? null;
  const alexander = employees.find((employee) => employee.id === "alexander") ?? null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => {
      control.playing = true;
      setPlaying(true);
    }, reduce ? 500 : 7600);
    return () => window.clearTimeout(id);
  }, [control]);

  function enter() {
    control.playing = true;
    setPlaying(true);
  }

  function approach(roomId: string) {
    const room = ROOMS.find((item) => item.id === roomId);
    if (!room) return;
    control.autopilot = visitPoint(room);
    control.playing = true;
    setPlaying(true);
    setDirectoryOpen(false);
  }

  function approachPerson(id: string) {
    const person = employees.find((employee) => employee.id === id);
    if (!person) return;
    control.autopilot = { x: person.position.x, z: person.position.z + 1.55 };
    control.playing = true;
    setPlaying(true);
    setSelectedId(id);
    setDirectoryOpen(false);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="office-root">
        <div className="office-canvas">
          {mounted && (
            <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [0, 2.4, 12], fov: 56, near: 0.1, far: 80 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.85;
            }}
            onPointerMissed={() => setSelectedId(null)}
          >
            <OfficeScene employees={employees} selectedId={selectedId} onSelect={setSelectedId} control={control} />
            </Canvas>
          )}
        </div>

        <header className="office-top">
          <div>
            <p className="office-kicker">AI Company OS</p>
            <h1>Virtual floor</h1>
          </div>
          <div className="office-top-actions">
            <span className={office.connected ? "office-live is-on" : "office-live"}>
              {office.connected ? "Live" : "Linking"}
            </span>
            <Link to="/dashboard" className="office-ghost">
              Command Center
            </Link>
          </div>
        </header>

        <div className="office-feed" aria-live="polite">
          {office.linkError && <p className="office-alert">{office.linkError}</p>}
          {office.feed.slice(0, 3).map((event) => (
            <p key={event.id}>{eventLabel(event.type, event.data)}</p>
          ))}
        </div>

        <FloorMap employees={employees} />

        <FloorDossier
          employee={selected}
          alexander={alexander}
          onClose={() => setSelectedId(null)}
          onCommand={() => setCommandOpen(true)}
        />

        <div className="office-stick" aria-hidden={!playing}>
          <Joystick
            onChange={(axes) => {
              control.touch = axes;
            }}
          />
          <p>Move</p>
        </div>

        <div className="office-help">
          <p>W forward · S back · A turn left · D turn right</p>
          <button type="button" className="office-ghost" onClick={() => setDirectoryOpen((open) => !open)}>
            Rooms
          </button>
        </div>

        {directoryOpen && (
          <div className="office-directory">
            {employees.map((employee) => (
              <button key={employee.id} type="button" onClick={() => approachPerson(employee.id)}>
                {employee.name}
              </button>
            ))}
            {ROOMS.map((room) => (
              <button key={room.id} type="button" onClick={() => approach(room.id)}>
                {room.name}
              </button>
            ))}
          </div>
        )}

        {commandOpen && (
          <div className="office-modal-back" role="presentation" onClick={() => setCommandOpen(false)}>
            <motion.div
              className="office-modal"
              role="dialog"
              aria-labelledby="command-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="office-kicker">Founder command</p>
              <h2 id="command-title">Instruct Alexander</h2>
              <p className="office-note">Same command desk as the Command Center. Plans and assignments only — nothing is deployed.</p>
              <CommandComposer
                onSubmit={async (command) => {
                  await office.sendCommand(command);
                }}
              />
              {office.commandError && <p className="office-alert">{office.commandError}</p>}
              {office.commandResult && (
                <div className="office-result">
                  <p>
                    Project <strong>{office.commandResult.project}</strong> · {office.commandResult.status}
                  </p>
                  <p>{office.commandResult.strategy.objective}</p>
                </div>
              )}
              <button type="button" className="office-ghost" onClick={() => setCommandOpen(false)}>
                Close
              </button>
            </motion.div>
          </div>
        )}

        {!playing && (
          <div className="office-gate">
            <div>
              <p className="office-kicker">Headquarters</p>
              <h2>The company is already at work.</h2>
              <p>
                A short reveal of the floor, then the bridge is yours. Walk in. Alexander holds the CEO room — the same command desk as the Command Center.
              </p>
              <button type="button" className="office-primary" onClick={enter}>
                Start
              </button>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

function FloorMap({ employees }: { employees: ReturnType<typeof useVirtualOffice>["state"]["employees"] }) {
  const pose = useFounderPose();
  return (
    <svg className="office-map" viewBox="-22 -22 44 44" role="img" aria-label="Floor map">
      {ROOMS.map((room) => (
        <rect
          key={room.id}
          x={room.x - room.w / 2}
          y={room.z - room.d / 2}
          width={room.w}
          height={room.d}
          className={room.accent === "gold" ? "map-gold" : "map-blue"}
        />
      ))}
      {employees.map((employee) => (
        <circle key={employee.id} cx={employee.position.x} cy={employee.position.z} r={0.55} className="map-person" />
      ))}
      <circle cx={pose.x} cy={pose.z} r={0.7} className="map-founder" />
    </svg>
  );
}

function FloorDossier({
  employee,
  alexander,
  onClose,
  onCommand,
}: {
  employee: ReturnType<typeof useVirtualOffice>["state"]["employees"][number] | null;
  alexander: ReturnType<typeof useVirtualOffice>["state"]["employees"][number] | null;
  onClose: () => void;
  onCommand: () => void;
}) {
  const pose = useFounderPose();
  return (
    <InteractionPanel
      employee={employee}
      alexander={alexander}
      nearCeo={pose.nearCeo}
      onClose={onClose}
      onCommand={onCommand}
    />
  );
}

function eventLabel(type: string, data: Record<string, unknown>): string {
  const name = typeof data.name === "string" ? data.name : "Company";
  if (type === "employee_status_changed") return `${name} · ${String(data.status ?? "updated")}`;
  if (type === "task_assigned") return `${name} assigned`;
  if (type === "task_completed") return `${name} completed a task`;
  if (type === "meeting_started") return "Meeting started";
  if (type === "project_phase_changed") return `${String(data.name ?? "Project")} · ${String(data.phase ?? data.status ?? "")}`;
  return type;
}

function Joystick({ onChange }: { onChange: (axes: { steer: number; throttle: number }) => void }) {
  const pad = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);

  function update(clientX: number, clientY: number) {
    const el = pad.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const dead = (value: number) => (Math.abs(value) < 0.18 ? 0 : Math.max(-1, Math.min(1, value)));
    onChange({ steer: dead(-dx), throttle: dead(-dy) });
  }

  return (
    <div
      ref={pad}
      className="office-pad"
      onPointerDown={(event) => {
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (pointer.current !== event.pointerId) return;
        update(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        if (pointer.current !== event.pointerId) return;
        pointer.current = null;
        onChange({ steer: 0, throttle: 0 });
      }}
    >
      <span />
    </div>
  );
}
