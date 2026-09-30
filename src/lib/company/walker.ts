import { officeWalls, resolveWalls } from "./layout.ts";
import type { Aabb } from "@/types/office";

export type WalkerState = { x: number; z: number; yaw: number; speed: number };
export type TouchAxes = { steer: number; throttle: number };

const WALLS = officeWalls();

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function wrapPi(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function axesFromInput(keys: ReadonlySet<string>, touch: TouchAxes): TouchAxes {
  let steer = 0;
  let throttle = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
  if (steer === 0 && throttle === 0) {
    steer = touch.steer;
    throttle = touch.throttle;
  }
  return { steer: clamp(steer, -1, 1), throttle: clamp(throttle, -1, 1) };
}

/**
 * On-foot founder. yaw 0 faces world −Z.
 * A / left increases yaw (nose turns left under the chase camera).
 * D / right decreases yaw.
 */
export function stepWalker(
  walker: WalkerState,
  keys: ReadonlySet<string>,
  touch: TouchAxes,
  autopilot: { x: number; z: number } | null,
  dt: number,
  walls: readonly Aabb[] = WALLS,
): WalkerState {
  const delta = Math.min(Math.max(dt, 0), 0.1);
  let { steer, throttle } = axesFromInput(keys, touch);
  let dropAutopilot = false;

  if (steer === 0 && throttle === 0 && autopilot && keys.size === 0) {
    const dx = autopilot.x - walker.x;
    const dz = autopilot.z - walker.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.55) {
      dropAutopilot = true;
    } else {
      const desired = Math.atan2(-dx, -dz);
      const diff = wrapPi(desired - walker.yaw);
      steer = clamp(diff * 2.4, -1, 1);
      throttle = Math.abs(diff) < 0.9 ? 1 : 0.4;
    }
  }

  const turnRate = 2.35;
  const accel = 9;
  let speed = walker.speed + throttle * accel * delta;
  if (throttle === 0) {
    const drag = 8 * delta;
    if (Math.abs(speed) <= drag) speed = 0;
    else speed -= Math.sign(speed) * drag;
  }
  speed = clamp(speed, -2.4, 4.4);

  const moving = Math.abs(speed) > 0.08 || Math.abs(throttle) > 0;
  const speedFactor = Math.min(1, Math.abs(speed) / 1.15);
  const reverse = speed >= 0 ? 1 : -1;
  const yaw =
    walker.yaw +
    steer * turnRate * (moving ? Math.max(speedFactor, Math.abs(throttle) > 0 ? 0.72 : 0) : 0) * reverse * delta;

  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  const resolved = resolveWalls(walker.x + fx * speed * delta, walker.z + fz * speed * delta, 0.34, walls);

  return {
    x: resolved.x,
    z: resolved.z,
    yaw,
    speed: dropAutopilot ? 0 : speed,
  };
}

export function autopilotCleared(
  walker: WalkerState,
  autopilot: { x: number; z: number } | null,
): boolean {
  if (!autopilot) return false;
  return Math.hypot(autopilot.x - walker.x, autopilot.z - walker.z) < 0.55 && Math.abs(walker.speed) < 0.2;
}
