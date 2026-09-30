import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ROOMS, ROSTER } from "@/lib/company/layout";
import type { OfficeEmployee } from "@/types/office";
import { CameraController, type FloorControl } from "./CameraController";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { Headquarters } from "./Headquarters";
import { OfficeRoom } from "./OfficeRoom";
import { ROOM_COLOR } from "./theme";

function StatusWall({ employees }: { employees: OfficeEmployee[] }) {
  const signature = employees.map((employee) => `${employee.id}:${employee.status}`).join("|");
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#071018";
      ctx.fillRect(0, 0, 640, 360);
      ctx.strokeStyle = "#d6b36a";
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 608, 328);
      ctx.fillStyle = "#d6b36a";
      ctx.font = "600 28px Outfit, sans-serif";
      ctx.fillText("COMPANY FLOOR", 40, 64);
      ctx.font = "500 22px Outfit, sans-serif";
      employees.forEach((employee, index) => {
        const y = 118 + index * 36;
        const accent = ROSTER.find((person) => person.id === employee.id)?.accent ?? "#3ec5ff";
        ctx.fillStyle = employee.status === "failed" ? "#e15b64" : accent;
        ctx.fillRect(40, y - 14, 12, 12);
        ctx.fillStyle = "#e7eef6";
        ctx.fillText(employee.name, 68, y);
        ctx.fillStyle = "#8d9aab";
        ctx.fillText(employee.status, 280, y);
      });
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 4;
    map.needsUpdate = true;
    return map;
    // Paint only when the status signature changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 1.7, 2.55]}>
      <planeGeometry args={[2.4, 1.35]} />
      <meshStandardMaterial map={texture} emissive="#d6b36a" emissiveIntensity={0.2} toneMapped={false} />
    </mesh>
  );
}

function MeetingTable() {
  return (
    <group position={[0, 0, -2.1]}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.07, 1.4]} />
        <meshStandardMaterial color="#16140f" metalness={0.72} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <boxGeometry args={[2.4, 0.012, 0.04]} />
        <meshBasicMaterial color="#d6b36a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.55, 32]} />
        <meshBasicMaterial color="#3ec5ff" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]}>
          <boxGeometry args={[0.08, 0.72, 1.15]} />
          <meshStandardMaterial color="#12171e" metalness={0.4} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function FloorBloom() {
  const width = useThree((state) => state.size.width);
  if (width < 900) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={0.28} luminanceThreshold={0.9} mipmapBlur radius={0.3} />
    </EffectComposer>
  );
}

export function OfficeScene({
  employees,
  selectedId,
  onSelect,
  control,
}: {
  employees: OfficeEmployee[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  control: FloorControl;
}) {
  const alexander = employees.find((employee) => employee.id === "alexander");
  const accents = Object.fromEntries(ROSTER.map((person) => [person.id, person.accent]));
  const busyRooms = new Set(
    employees
      .filter((employee) => ["working", "review", "failed", "assigned"].includes(employee.status))
      .map((employee) => employee.room_id),
  );

  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 28, 64]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight color="#8fb4d4" groundColor="#1a140c" intensity={0.55} />
      <directionalLight
        position={[12, 18, 6]}
        intensity={1.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-8, 6, -10]} intensity={0.35} color="#d6b36a" />
      {ROOMS.map((room) => (
        <pointLight
          key={room.id}
          position={[room.x, 2.7, room.z]}
          color={ROOM_COLOR[room.id] ?? "#3ec5ff"}
          intensity={2.4}
          distance={9}
          decay={2}
        />
      ))}

      <Headquarters />
      <StatusWall employees={employees} />

      {ROOMS.map((room) => (
        <OfficeRoom
          key={room.id}
          room={room}
          deskActive={room.id === "meeting" ? employees.some((employee) => employee.status === "meeting") : busyRooms.has(room.id)}
        />
      ))}
      <MeetingTable />

      {employees.map((employee) => (
        <EmployeeAvatar
          key={employee.id}
          name={employee.name}
          role={employee.role}
          status={employee.status}
          accent={accents[employee.id] ?? "#3ec5ff"}
          animation={employee.animation}
          position={employee.position}
          facing={employee.facing}
          selected={selectedId === employee.id}
          onSelect={() => onSelect(employee.id)}
        />
      ))}

      <CameraController
        control={control}
        alexander={alexander ? { x: alexander.position.x, z: alexander.position.z } : null}
      />
      <FloorBloom />
    </>
  );
}
