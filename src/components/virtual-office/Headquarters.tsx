import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh } from "three";
import { ROOMS, approachPoint } from "@/lib/company/layout";
import { ROOM_COLOR } from "./theme";

function panelTexture(title: string, lines: string[], accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, 512, 320);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 488, 296);
    ctx.fillStyle = accent;
    ctx.font = "600 36px Outfit, sans-serif";
    ctx.fillText(title, 36, 68);
    ctx.font = "500 24px Outfit, sans-serif";
    ctx.fillStyle = "#d5dee8";
    lines.forEach((line, index) => ctx.fillText(line, 36, 120 + index * 36));
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.needsUpdate = true;
  return map;
}

function Neon({ x1, z1, x2, z2, color }: { x1: number; z1: number; x2: number; z2: number; color: string }) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.max(0.2, Math.hypot(dx, dz));
  const rot = Math.atan2(dx, dz);
  return (
    <mesh position={[(x1 + x2) / 2, 0.03, (z1 + z2) / 2]} rotation={[0, rot, 0]}>
      <boxGeometry args={[0.06, 0.012, len]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

export function Headquarters() {
  const core = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const motes = useRef<Group>(null);
  const brief = useMemo(
    () => panelTexture("AI COMPANY", ["Headquarters online", "Six seats on the floor", "Founder has the bridge"], "#d6b36a"),
    [],
  );
  const live = useMemo(
    () => panelTexture("FLOOR LINK", ["Snapshot is truth", "Events are the fast path", "Commands stay with Alexander"], "#3ec5ff"),
    [],
  );
  useEffect(
    () => () => {
      brief.dispose();
      live.dispose();
    },
    [brief, live],
  );

  const specks = useMemo(() => {
    const count = 42;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.85 + (i % 5) * 0.22;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.6 + (i % 7) * 0.28;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.72;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    if (core.current) core.current.rotation.y += delta * 0.4;
    if (ring.current) ring.current.rotation.z += delta * 0.6;
    if (motes.current) motes.current.rotation.y -= delta * 0.15;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[48, 50]} />
        <meshStandardMaterial color="#1a2633" metalness={0.45} roughness={0.38} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 4.2]}>
        <circleGeometry args={[6.4, 64]} />
        <meshStandardMaterial color="#243246" metalness={0.35} roughness={0.4} />
      </mesh>
      <gridHelper args={[40, 40, "#163044", "#101820"]} position={[0, 0.018, 0]} />

      <Neon x1={0} z1={-19} x2={0} z2={18} color="#d6b36a" />
      {ROOMS.filter((room) => room.id !== "meeting").map((room) => {
        const door = approachPoint(room);
        return <Neon key={room.id} x1={door.x} z1={door.z} x2={0} z2={door.z} color={ROOM_COLOR[room.id] ?? "#3ec5ff"} />;
      })}

      <group position={[0, 0, 4.15]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.72, 0.9, 0.12, 6]} />
          <meshStandardMaterial color="#141820" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.86, 48]} />
          <meshBasicMaterial color="#d6b36a" toneMapped={false} />
        </mesh>
        <group ref={core} position={[0, 1.35, 0]}>
          <mesh>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial color="#d6b36a" emissive="#d6b36a" emissiveIntensity={0.85} metalness={0.4} roughness={0.2} toneMapped={false} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.62, 1]} />
            <meshBasicMaterial color="#3ec5ff" wireframe transparent opacity={0.85} toneMapped={false} />
          </mesh>
          <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.78, 0.015, 8, 48]} />
            <meshBasicMaterial color="#d6b36a" toneMapped={false} />
          </mesh>
        </group>
        <group ref={motes}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[specks, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#e7eef6" size={0.035} transparent opacity={0.75} depthWrite={false} />
          </points>
        </group>
        <pointLight position={[0, 1.6, 0]} color="#d6b36a" intensity={4} distance={8} />
      </group>

      <mesh position={[-4.35, 1.45, 5.35]} rotation={[0, 0.5, 0]}>
        <planeGeometry args={[1.7, 1.05]} />
        <meshStandardMaterial map={brief} emissive="#d6b36a" emissiveIntensity={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[4.35, 1.45, 5.35]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[1.7, 1.05]} />
        <meshStandardMaterial map={live} emissive="#3ec5ff" emissiveIntensity={0.18} toneMapped={false} />
      </mesh>
    </group>
  );
}
