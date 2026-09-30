import type { OfficeRoom } from "@/types/office";
import { ROOM_COLOR } from "./theme";

function Panel({
  position,
  rotation,
  color,
  args,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  args: [number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={args} />
        <meshStandardMaterial color="#070c12" emissive={color} emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[args[0] + 0.06, args[1] + 0.06, 0.03]} />
        <meshStandardMaterial color="#121820" metalness={0.7} roughness={0.28} />
      </mesh>
    </group>
  );
}

export function RoomDressing({ room }: { room: OfficeRoom }) {
  const color = ROOM_COLOR[room.id] ?? "#3ec5ff";
  const base: [number, number, number] = [room.x, 0, room.z];

  if (room.id === "ceo") {
    return (
      <group position={base}>
        <mesh position={[0, 0.78, -1.15]}>
          <cylinderGeometry args={[1.15, 1.15, 0.06, 32]} />
          <meshStandardMaterial color="#1a1712" metalness={0.62} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.84, -1.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.95, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
        </mesh>
        <Panel position={[0, 1.7, -3.55]} color={color} args={[3.2, 1.15]} />
        {[ -1.1, -0.2, 0.7 ].map((x) => (
          <mesh key={x} position={[x, 1.55, -3.5]}>
            <boxGeometry args={[0.55, 0.08, 0.01]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
    );
  }

  if (room.id === "technology") {
    return (
      <group position={base}>
        {[-1.6, -0.7].map((x) => (
          <group key={x} position={[x, 0, -2.4]}>
            <mesh position={[0, 1.05, 0]} castShadow>
              <boxGeometry args={[0.7, 1.9, 0.4]} />
              <meshStandardMaterial color="#121820" metalness={0.55} roughness={0.35} />
            </mesh>
            {[0.4, 0.9, 1.4].map((y) => (
              <mesh key={y} position={[0, y, 0.21]}>
                <boxGeometry args={[0.5, 0.06, 0.01]} />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
            ))}
          </group>
        ))}
        <Panel position={[2.6, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} color={color} args={[2.2, 1.1]} />
      </group>
    );
  }

  if (room.id === "product") {
    return (
      <group position={base}>
        <Panel position={[0, 1.65, -3.2]} color={color} args={[3.4, 1.3]} />
        {[-1.2, 0, 1.2].map((x, index) => (
          <mesh key={x} position={[x, 1.15 + index * 0.15, -3.1]}>
            <boxGeometry args={[0.85, 0.12, 0.02]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 1.15, 0.4]}>
          <boxGeometry args={[1.4, 0.9, 0.04]} />
          <meshStandardMaterial color="#100c0a" emissive={color} emissiveIntensity={0.35} toneMapped={false} />
        </mesh>
      </group>
    );
  }

  if (room.id === "design") {
    return (
      <group position={base}>
        {[-0.7, 0.15, 0.95].map((x, index) => (
          <mesh key={x} position={[x, 1.35, -1.6]} rotation={[0, 0.2 - index * 0.2, 0]}>
            <boxGeometry args={[0.7, 1.05, 0.04]} />
            <meshStandardMaterial color="#140e1c" emissive={color} emissiveIntensity={0.4} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.38, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>
    );
  }

  if (room.id === "development") {
    return (
      <group position={base}>
        <Panel position={[0, 1.7, 2.8]} rotation={[0, Math.PI, 0]} color={color} args={[2.6, 1.15]} />
        {[0, 1, 2, 3].map((step) => (
          <mesh key={step} position={[-1.1 + step * 0.55, 1.15, 1.4]}>
            <boxGeometry args={[0.38, 0.18 + step * 0.12, 0.08]} />
            <meshStandardMaterial color="#0c1418" emissive={color} emissiveIntensity={0.45} toneMapped={false} />
          </mesh>
        ))}
      </group>
    );
  }

  if (room.id === "qa") {
    return (
      <group position={base}>
        <Panel position={[0, 1.6, 2.9]} rotation={[0, Math.PI, 0]} color={color} args={[3.4, 1.2]} />
        {[-0.9, 0, 0.9].map((x, index) => (
          <mesh key={x} position={[x, 0.7 + index * 0.15, 1.6]}>
            <boxGeometry args={[0.5, 0.5, 0.08]} />
            <meshStandardMaterial color="#0c1410" emissive={index === 1 ? "#e15b64" : color} emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <mesh position={[room.x, 0.04, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.7, 1.78, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
    </mesh>
  );
}
