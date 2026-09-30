import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { Vector3 } from "three";
import { publishFounder } from "@/lib/company/founder-store";
import { FOUNDER_SPAWN } from "@/lib/company/layout";
import { autopilotCleared, stepWalker, type TouchAxes } from "@/lib/company/walker";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (value: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}

export type FloorControl = {
  playing: boolean;
  touch: TouchAxes;
  autopilot: { x: number; z: number } | null;
};

type Props = {
  control: FloorControl;
  alexander: { x: number; z: number } | null;
};

const desired = new Vector3();
const look = new Vector3();

export function CameraController({ control, alexander }: Props) {
  const { camera, gl } = useThree();
  const body = useRef<Group>(null);
  const walker = useRef({ x: FOUNDER_SPAWN.x, z: FOUNDER_SPAWN.z, yaw: FOUNDER_SPAWN.yaw, speed: 0 });
  const intro = useRef(0);
  const keys = useRef(new Set<string>());
  const injected = useRef<Set<string> | null>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
      }
      injected.current = null;
      keys.current.add(event.code);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    const probe = {
      getYaw: () => walker.current.yaw,
      getSpeed: () => walker.current.speed,
      setKeys: (codes: string[]) => {
        injected.current = new Set(codes);
      },
      setSteer: (value: number) => {
        control.touch.steer = value;
      },
    };
    window.__controlsTest = probe;
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      if (window.__controlsTest === probe) delete window.__controlsTest;
    };
  }, [control]);

  useEffect(() => {
    const canvas = gl.domElement;
    const pointerDown = (event: PointerEvent) => {
      if (!control.playing) return;
      dragging.current = true;
      lastX.current = event.clientX;
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - lastX.current;
      lastX.current = event.clientX;
      walker.current.yaw -= dx * 0.005;
    };
    const pointerUp = () => {
      dragging.current = false;
    };
    canvas.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, [gl, control]);

  useFrame((_, delta) => {
    const activeKeys = injected.current ?? keys.current;
    const simulate = control.playing || injected.current != null;
    if (!simulate) {
      intro.current = Math.min(9, intro.current + delta);
      const u = Math.min(1, intro.current / 7.2);
      const ease = u * u * (3 - 2 * u);
      const ang = 0.2 + ease * 1.15;
      const rad = 13 - ease * 5;
      const y = 7.6 - ease * 4.4;
      const focusZ = 2 - ease * 2;
      camera.position.set(Math.sin(ang) * rad, Math.max(2.5, y), 8.4 + Math.cos(ang) * 3.2);
      camera.lookAt(0, 1.15, focusZ);
      publishFounder({
        x: walker.current.x,
        z: walker.current.z,
        yaw: walker.current.yaw,
        speed: 0,
        nearCeo: false,
      });
      return;
    }
    const next = stepWalker(walker.current, activeKeys, control.touch, control.autopilot, delta);
    walker.current = next;
    if (control.autopilot && (activeKeys.size > 0 || autopilotCleared(next, control.autopilot))) {
      control.autopilot = null;
    }
    const { x, z, yaw, speed } = walker.current;
    body.current?.position.set(x, 0, z);
    if (body.current) body.current.rotation.y = Math.PI + yaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    desired.set(x - fx * 4.8, 2.25, z - fz * 4.8);
    const blend = 1 - Math.exp(-5.5 * Math.min(delta, 0.1));
    camera.position.lerp(desired, blend);
    look.set(x, 1.15, z);
    camera.lookAt(look);
    const nearCeo = alexander ? Math.hypot(alexander.x - x, alexander.z - z) < 2.35 : false;
    publishFounder({ x, z, yaw, speed, nearCeo });
  });

  return (
    <group ref={body} position={[FOUNDER_SPAWN.x, 0, FOUNDER_SPAWN.z]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 6, 12]} />
        <meshStandardMaterial color="#1c2430" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.16, 18, 14]} />
        <meshStandardMaterial color="#d6b36a" emissive="#d6b36a" emissiveIntensity={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.34, 0.42, 24]} />
        <meshBasicMaterial color="#d6b36a" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
