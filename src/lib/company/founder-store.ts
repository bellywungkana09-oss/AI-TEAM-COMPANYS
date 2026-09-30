import { useSyncExternalStore } from "react";
import type { FounderPose } from "@/types/office";
import { FOUNDER_SPAWN } from "./layout";

let pose: FounderPose = { x: FOUNDER_SPAWN.x, z: FOUNDER_SPAWN.z, yaw: FOUNDER_SPAWN.yaw, speed: 0, nearCeo: false };
const listeners = new Set<() => void>();
let notifyQueued = false;

export function publishFounder(next: FounderPose): void {
  if (
    Math.abs(next.x - pose.x) < 0.05 &&
    Math.abs(next.z - pose.z) < 0.05 &&
    Math.abs(next.yaw - pose.yaw) < 0.03 &&
    Math.abs(next.speed - pose.speed) < 0.05 &&
    next.nearCeo === pose.nearCeo
  ) {
    return;
  }
  pose = next;
  if (notifyQueued) return;
  notifyQueued = true;
  requestAnimationFrame(() => {
    notifyQueued = false;
    listeners.forEach((listener) => listener());
  });
}

export function getFounderPose(): FounderPose {
  return pose;
}

export function useFounderPose(): FounderPose {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getFounderPose,
    getFounderPose,
  );
}
