import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { OfficeAnimation } from "@/types/office";
import type { EmployeeStatus } from "@/types/company";
import { EmployeeStatusBubble } from "./EmployeeStatusBubble";

type Props = {
  name: string;
  role: string;
  status: EmployeeStatus;
  accent: string;
  animation: OfficeAnimation;
  position: { x: number; y: number; z: number };
  facing: number;
  selected: boolean;
  onSelect: () => void;
};

export function EmployeeAvatar({
  name,
  role,
  status,
  accent,
  animation,
  position,
  facing,
  selected,
  onSelect,
}: Props) {
  const root = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const head = useRef<Group>(null);
  const visor = useRef<Mesh>(null);
  const spot = useRef({ x: position.x, z: position.z, facing });

  useFrame((state, delta) => {
    const rig = root.current;
    if (!rig) return;
    const dt = Math.min(delta, 0.1);
    const current = spot.current;
    current.x += (position.x - current.x) * Math.min(1, dt * 2.4);
    current.z += (position.z - current.z) * Math.min(1, dt * 2.4);
    const turn = Math.atan2(Math.sin(facing - current.facing), Math.cos(facing - current.facing));
    current.facing += turn * Math.min(1, dt * 4);
    const remain = Math.hypot(position.x - current.x, position.z - current.z);
    const anim: OfficeAnimation = remain > 0.22 ? "walk" : animation === "failed" ? "alert" : animation;
    const t = state.clock.elapsedTime;
    const seated = anim === "working" || anim === "review";
    rig.position.set(current.x, seated ? -0.18 : Math.sin(t * 1.6) * 0.012, current.z);
    rig.rotation.y = Math.PI + current.facing;

    const armL = leftArm.current;
    const armR = rightArm.current;
    const legL = leftLeg.current;
    const legR = rightLeg.current;
    const skull = head.current;
    if (!armL || !armR || !legL || !legR || !skull) return;

    armL.rotation.set(0.15, 0, 0.12);
    armR.rotation.set(0.15, 0, -0.12);
    legL.rotation.set(0, 0, 0);
    legR.rotation.set(0, 0, 0);
    skull.rotation.set(0, Math.sin(t * 0.6) * 0.08, 0);
    const visorMaterial = visor.current?.material;
    if (visorMaterial && !Array.isArray(visorMaterial) && "emissiveIntensity" in visorMaterial) {
      visorMaterial.emissiveIntensity = anim === "alert" ? 0.7 + Math.sin(t * 8) * 0.3 : 0.9;
    }

    if (anim === "walk") {
      const step = Math.sin(t * 8);
      legL.rotation.x = step * 0.55;
      legR.rotation.x = -step * 0.55;
      armL.rotation.x = -step * 0.4;
      armR.rotation.x = step * 0.4;
    } else if (anim === "working") {
      armL.rotation.x = -1.05 + Math.sin(t * 11) * 0.18;
      armR.rotation.x = -1.05 + Math.sin(t * 11 + 1.2) * 0.18;
      skull.rotation.x = 0.32;
    } else if (anim === "review") {
      armL.rotation.x = -0.75;
      armR.rotation.x = -0.9;
      skull.rotation.x = 0.4;
    } else if (anim === "meeting") {
      armR.rotation.x = -0.85 + Math.sin(t * 2.2) * 0.28;
      armR.rotation.z = -0.2;
      skull.rotation.y = Math.sin(t * 1.1) * 0.25;
    } else if (anim === "thinking") {
      armR.rotation.x = -1.4;
      armR.rotation.z = -0.4;
      skull.rotation.x = -0.08 + Math.sin(t * 0.8) * 0.05;
    } else if (anim === "alert") {
      rig.position.x += Math.sin(t * 16) * 0.01;
      skull.rotation.x = 0.12;
    } else if (anim === "completed") {
      skull.rotation.x = Math.max(0, Math.sin(t * 1.4)) * 0.22;
      armR.rotation.x = -0.4;
    }
  });

  const shell = "#1a2030";
  const plate = "#2c3548";

  return (
    <group
      ref={root}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.32, selected ? 0.48 : 0.4, 28]} />
        <meshBasicMaterial color={status === "failed" ? "#e15b64" : accent} transparent opacity={selected ? 0.95 : 0.45} />
      </mesh>

      <group ref={leftLeg} position={[-0.11, 0.78, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
          <meshStandardMaterial color={shell} metalness={0.45} roughness={0.4} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.11, 0.78, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.28, 4, 8]} />
          <meshStandardMaterial color={shell} metalness={0.45} roughness={0.4} />
        </mesh>
      </group>

      <mesh position={[0, 1.08, 0]} castShadow>
        <boxGeometry args={[0.42, 0.5, 0.24]} />
        <meshStandardMaterial color={plate} metalness={0.62} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.14, 0.12]}>
        <boxGeometry args={[0.16, 0.1, 0.03]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.28]} />
        <meshStandardMaterial color="#121722" metalness={0.7} roughness={0.3} />
      </mesh>

      <group ref={leftArm} position={[-0.28, 1.26, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.28, 4, 8]} />
          <meshStandardMaterial color={plate} metalness={0.5} roughness={0.35} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.28, 1.26, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.28, 4, 8]} />
          <meshStandardMaterial color={plate} metalness={0.5} roughness={0.35} />
        </mesh>
      </group>

      <group ref={head} position={[0, 1.58, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.145, 20, 16]} />
          <meshStandardMaterial color="#12151c" metalness={0.72} roughness={0.22} />
        </mesh>
        <mesh ref={visor} position={[0, 0.01, 0.09]}>
          <boxGeometry args={[0.16, 0.05, 0.04]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
        </mesh>
      </group>

      {(animation === "review" || status === "review") && (
        <mesh position={[0.16, 1.05, 0.22]} rotation={[-0.7, 0.2, 0]}>
          <boxGeometry args={[0.18, 0.12, 0.012]} />
          <meshStandardMaterial color="#071018" emissive={accent} emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
      )}
      <EmployeeStatusBubble name={name} role={role} status={status} />
    </group>
  );
}
