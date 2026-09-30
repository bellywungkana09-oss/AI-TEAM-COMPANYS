import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { OfficeRoom } from "@/types/office";
import { ACCENT, deskPoint, workYaw } from "@/lib/company/layout";
import { ROOM_COLOR } from "./theme";

export function Desk({ room, active }: { room: OfficeRoom; active: boolean }) {
  const screen = useRef<Mesh>(null);
  const spot = deskPoint(room);
  const yaw = workYaw(room);
  const accent = ROOM_COLOR[room.id] ?? (room.accent === "gold" ? ACCENT.gold : ACCENT.blue);

  useFrame((state) => {
    const material = screen.current?.material;
    if (!material || Array.isArray(material) || !("emissiveIntensity" in material)) return;
    const pulse = active ? 0.7 + Math.sin(state.clock.elapsedTime * 3) * 0.25 : 0.18;
    material.emissiveIntensity = pulse;
  });

  return (
    <group position={[spot.x, 0, spot.z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.06, 0.62]} />
        <meshStandardMaterial color="#1c2430" metalness={0.72} roughness={0.22} />
      </mesh>
      <mesh position={[-0.55, 0.38, 0]}>
        <boxGeometry args={[0.06, 0.7, 0.5]} />
        <meshStandardMaterial color="#12171e" />
      </mesh>
      <mesh position={[0.55, 0.38, 0]}>
        <boxGeometry args={[0.06, 0.7, 0.5]} />
        <meshStandardMaterial color="#12171e" />
      </mesh>
      <mesh position={[0, 0.78, 0.16]}>
        <boxGeometry args={[0.42, 0.02, 0.16]} />
        <meshStandardMaterial color="#0c1016" />
      </mesh>
      <mesh position={[0, 1.08, -0.18]}>
        <boxGeometry args={[0.72, 0.46, 0.04]} />
        <meshStandardMaterial color="#0a0e13" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh ref={screen} position={[0, 1.08, -0.15]}>
        <planeGeometry args={[0.62, 0.36]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}
