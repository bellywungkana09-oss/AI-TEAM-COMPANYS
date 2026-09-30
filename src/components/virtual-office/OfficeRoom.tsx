import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { Aabb, OfficeRoom as Room } from "@/types/office";
import { wallsFor } from "@/lib/company/layout";
import { Desk } from "./Desk";
import { RoomDressing } from "./RoomDressing";
import { ROOM_COLOR } from "./theme";

function Wall({ box, accent }: { box: Aabb; accent: string }) {
  const sx = Math.max(0.08, box.maxX - box.minX);
  const sz = Math.max(0.08, box.maxZ - box.minZ);
  const cx = (box.minX + box.maxX) / 2;
  const cz = (box.minZ + box.maxZ) / 2;
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx, 0.84, sz]} />
        <meshStandardMaterial color="#10151d" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, 1.78, 0]}>
        <boxGeometry args={[sx, 1.8, sz]} />
        <meshStandardMaterial
          color="#9fd4ea"
          transparent
          opacity={0.1}
          roughness={0.05}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 2.72, 0]}>
        <boxGeometry args={[sx, 0.035, sz]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function OfficeRoom({ room, deskActive }: { room: Room; deskActive: boolean }) {
  const accent = ROOM_COLOR[room.id] ?? "#3ec5ff";
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[room.x, 0.021, room.z]} receiveShadow>
        <planeGeometry args={[room.w - 0.28, room.d - 0.28]} />
        <meshStandardMaterial color="#1c2836" metalness={0.28} roughness={0.5} />
      </mesh>
      {wallsFor(room).map((box, index) => (
        <Wall key={`${room.id}-${index}`} box={box} accent={accent} />
      ))}
      {room.id !== "meeting" && <Desk room={room} active={deskActive} />}
      <RoomDressing room={room} />
      <RoomLabel name={room.name} accent={accent} position={[room.x, 2.42, room.z]} />
    </group>
  );
}

function RoomLabel({ name, accent, position }: { name: string; accent: string; position: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 512, 96);
      ctx.fillStyle = "rgba(5, 8, 14, 0.72)";
      ctx.fillRect(24, 16, 464, 64);
      ctx.fillStyle = accent;
      ctx.font = "600 32px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(name.toUpperCase(), 256, 58);
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [accent, name]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[2.5, 0.46, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}
