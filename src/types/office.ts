import type { Employee, EmployeeStatus } from "./company";

export type OfficeAnimation =
  | "idle"
  | "walk"
  | "working"
  | "meeting"
  | "thinking"
  | "review"
  | "completed"
  | "failed"
  | "alert";

export type DoorSide = "n" | "s" | "e" | "w";

export type OfficeRoom = {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  doors: DoorSide[];
  accent: "gold" | "blue";
};

export type OfficePoint = { x: number; y: number; z: number };

export type OfficeEmployee = Employee & {
  room_id: string;
  position: OfficePoint;
  facing: number;
  animation: OfficeAnimation;
};

export type VirtualOfficeState = {
  epoch: number;
  seq: number;
  office: { rooms: OfficeRoom[] };
  employees: OfficeEmployee[];
};

export type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number };

export type FounderPose = {
  x: number;
  z: number;
  yaw: number;
  speed: number;
  nearCeo: boolean;
};

export function statusLabel(status: EmployeeStatus): string {
  switch (status) {
    case "idle":
      return "Available";
    case "assigned":
      return "Assigned";
    case "working":
      return "Working";
    case "meeting":
      return "In meeting";
    case "review":
      return "Reviewing";
    case "completed":
      return "Completed";
    case "failed":
      return "Needs attention";
  }
}
