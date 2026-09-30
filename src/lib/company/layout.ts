import type { Aabb, DoorSide, OfficeAnimation, OfficePoint, OfficeRoom } from "@/types/office";
import type { EmployeeStatus } from "@/types/company";

export const ACCENT = {
  gold: "#d6b36a",
  blue: "#3ec5ff",
  orange: "#ff8a3d",
  purple: "#b07cff",
  cyan: "#3dffe8",
  green: "#3dff9a",
} as const;

export const ROOMS: OfficeRoom[] = [
  { id: "ceo", name: "CEO Room", x: 0, z: -16.4, w: 11, d: 8, doors: ["s"], accent: "gold" },
  { id: "technology", name: "Technology", x: -13.6, z: -6.4, w: 8.6, d: 7.4, doors: ["e"], accent: "blue" },
  { id: "product", name: "Product", x: 13.6, z: -6.4, w: 8.6, d: 7.4, doors: ["w"], accent: "blue" },
  { id: "design", name: "Design", x: -13.6, z: 8.6, w: 8.6, d: 7.4, doors: ["e"], accent: "gold" },
  { id: "development", name: "Development", x: 13.6, z: 8.6, w: 8.6, d: 7.4, doors: ["w"], accent: "blue" },
  { id: "qa", name: "Quality Assurance", x: 0, z: 16.4, w: 11, d: 7.2, doors: ["n"], accent: "blue" },
  { id: "meeting", name: "Meeting Room", x: 0, z: -2.1, w: 9.4, d: 7.2, doors: ["n", "s"], accent: "gold" },
];

export type RosterEntry = {
  id: string;
  name: string;
  role: string;
  department: string;
  room_id: string;
  skills: string[];
  accent: string;
};

export const ROSTER: RosterEntry[] = [
  {
    id: "alexander",
    name: "Alexander",
    role: "CEO AI",
    department: "Executive",
    room_id: "ceo",
    skills: ["strategy", "leadership"],
    accent: ACCENT.gold,
  },
  {
    id: "marcus",
    name: "Marcus",
    role: "CTO AI",
    department: "Technology",
    room_id: "technology",
    skills: ["software architecture", "technical planning", "technology decision"],
    accent: ACCENT.blue,
  },
  {
    id: "olivia",
    name: "Olivia",
    role: "Product Manager AI",
    department: "Product",
    room_id: "product",
    skills: ["requirement analysis", "user story", "product planning"],
    accent: ACCENT.orange,
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "UI/UX Designer AI",
    department: "Design",
    room_id: "design",
    skills: ["ui design", "ux flow", "design system"],
    accent: ACCENT.purple,
  },
  {
    id: "david",
    name: "David",
    role: "Software Engineer AI",
    department: "Technology",
    room_id: "development",
    skills: ["frontend development", "backend development", "debugging"],
    accent: ACCENT.cyan,
  },
  {
    id: "emma",
    name: "Emma",
    role: "Quality Assurance AI",
    department: "Quality Assurance",
    room_id: "qa",
    skills: ["testing", "bug analysis", "quality review"],
    accent: ACCENT.green,
  },
];

export const FOUNDER_SPAWN = { x: 0, z: 6.6, yaw: 0 };

const roomById = Object.fromEntries(ROOMS.map((room) => [room.id, room]));

export function roomOf(id: string): OfficeRoom {
  const entry = ROSTER.find((person) => person.id === id);
  return roomById[entry?.room_id ?? "meeting"] ?? ROOMS[0]!;
}

function shift(room: OfficeRoom, alongDoor: number): { x: number; z: number } {
  const door = room.doors[0] ?? "s";
  if (door === "s") return { x: room.x, z: room.z - room.d / 2 + alongDoor };
  if (door === "n") return { x: room.x, z: room.z + room.d / 2 - alongDoor };
  if (door === "e") return { x: room.x - room.w / 2 + alongDoor, z: room.z };
  return { x: room.x + room.w / 2 - alongDoor, z: room.z };
}

export function deskPoint(room: OfficeRoom): { x: number; z: number } {
  return shift(room, 1.45);
}

export function chairPoint(room: OfficeRoom): { x: number; z: number } {
  return shift(room, 2.35);
}

export function greetPoint(room: OfficeRoom): { x: number; z: number } {
  return shift(room, room.d / 2 - 1.25);
}

export function meetingSeat(index: number): { x: number; z: number } {
  const room = roomById.meeting!;
  const angle = -Math.PI / 2 + (index / ROSTER.length) * Math.PI * 2;
  return { x: room.x + Math.cos(angle) * 2.2, z: room.z + Math.sin(angle) * 1.5 };
}

/** yaw 0 faces world −Z. */
export function yawToward(from: { x: number; z: number }, to: { x: number; z: number }): number {
  return Math.atan2(-(to.x - from.x), -(to.z - from.z));
}

export function workYaw(room: OfficeRoom): number {
  const door = room.doors[0] ?? "s";
  if (door === "s") return 0;
  if (door === "n") return Math.PI;
  if (door === "e") return Math.PI / 2;
  return -Math.PI / 2;
}

export function poseFor(id: string, status: EmployeeStatus): { position: OfficePoint; facing: number } {
  const index = Math.max(0, ROSTER.findIndex((person) => person.id === id));
  const room = roomOf(id);
  if (status === "meeting") {
    const seat = meetingSeat(index);
    const center = roomById.meeting!;
    return { position: { x: seat.x, y: 0, z: seat.z }, facing: yawToward(seat, center) };
  }
  if (status === "idle" || status === "completed") {
    const spot = greetPoint(room);
    const door = approachPoint(room);
    return { position: { x: spot.x, y: 0, z: spot.z }, facing: yawToward(spot, door) };
  }
  const chair = chairPoint(room);
  return { position: { x: chair.x, y: 0, z: chair.z }, facing: workYaw(room) };
}

export function approachPoint(room: OfficeRoom): { x: number; z: number } {
  const door = room.doors[0] ?? "s";
  const gap = 1.7;
  if (door === "s") return { x: room.x, z: room.z + room.d / 2 + gap };
  if (door === "n") return { x: room.x, z: room.z - room.d / 2 - gap };
  if (door === "e") return { x: room.x + room.w / 2 + gap, z: room.z };
  return { x: room.x - room.w / 2 - gap, z: room.z };
}

export function visitPoint(room: OfficeRoom): { x: number; z: number } {
  if (room.id === "meeting") return { x: room.x, z: room.z + room.d / 2 - 1.2 };
  const greet = greetPoint(room);
  const door = approachPoint(room);
  const dx = door.x - greet.x;
  const dz = door.z - greet.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: greet.x + (dx / len) * 1.45, z: greet.z + (dz / len) * 1.45 };
}

/** Status chooses the pose. Movement is a separate flag — assigned is not walking. */
export function animationFor(name: string, status: EmployeeStatus, moving: boolean): OfficeAnimation {
  if (moving) return "walk";
  if (status === "idle" && name === "Alexander") return "thinking";
  if (status === "idle" || status === "assigned") return "idle";
  if (status === "working") return "working";
  if (status === "meeting") return "meeting";
  if (status === "review") return "review";
  if (status === "completed") return "completed";
  return "alert";
}

function wall(x0: number, x1: number, z0: number, z1: number): Aabb {
  return { minX: Math.min(x0, x1), maxX: Math.max(x0, x1), minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1) };
}

function sideWalls(
  room: OfficeRoom,
  side: DoorSide,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  t: number,
): Aabb[] {
  const open = room.doors.includes(side);
  const gap = 1.85;
  if (side === "s" || side === "n") {
    const z = side === "s" ? z1 : z0;
    if (!open) return [wall(x0, x1, z - t, z + t)];
    return [wall(x0, room.x - gap / 2, z - t, z + t), wall(room.x + gap / 2, x1, z - t, z + t)];
  }
  const x = side === "e" ? x1 : x0;
  if (!open) return [wall(x - t, x + t, z0, z1)];
  return [wall(x - t, x + t, z0, room.z - gap / 2), wall(x - t, x + t, room.z + gap / 2, z1)];
}

export function wallsFor(room: OfficeRoom): Aabb[] {
  const t = 0.14;
  const x0 = room.x - room.w / 2;
  const x1 = room.x + room.w / 2;
  const z0 = room.z - room.d / 2;
  const z1 = room.z + room.d / 2;
  const boxes: Aabb[] = [];
  for (const side of ["n", "s", "e", "w"] as const) {
    boxes.push(...sideWalls(room, side, x0, x1, z0, z1, t));
  }
  return boxes;
}

export function officeWalls(): Aabb[] {
  const boxes = ROOMS.flatMap((room) => wallsFor(room));
  const bound = 22;
  boxes.push(wall(-bound, bound, -bound, -bound + 0.4));
  boxes.push(wall(-bound, bound, bound - 0.4, bound));
  boxes.push(wall(-bound, -bound + 0.4, -bound, bound));
  boxes.push(wall(bound - 0.4, bound, -bound, bound));
  return boxes;
}

export function resolveWalls(x: number, z: number, radius: number, boxes: readonly Aabb[]): { x: number; z: number } {
  let px = x;
  let pz = z;
  for (let pass = 0; pass < 3; pass += 1) {
    for (const box of boxes) {
      const minX = box.minX - radius;
      const maxX = box.maxX + radius;
      const minZ = box.minZ - radius;
      const maxZ = box.maxZ + radius;
      if (px <= minX || px >= maxX || pz <= minZ || pz >= maxZ) continue;
      const left = px - minX;
      const right = maxX - px;
      const down = pz - minZ;
      const up = maxZ - pz;
      const min = Math.min(left, right, down, up);
      if (min === left) px = minX;
      else if (min === right) px = maxX;
      else if (min === down) pz = minZ;
      else pz = maxZ;
    }
  }
  return { x: px, z: pz };
}
