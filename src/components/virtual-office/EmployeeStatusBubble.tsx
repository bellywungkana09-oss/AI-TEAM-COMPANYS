import { useEffect, useMemo } from "react";
import { CanvasTexture } from "three";
import type { EmployeeStatus } from "@/types/company";
import { statusLabel } from "@/types/office";

function labelTexture(name: string, role: string, status: string, alert: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new CanvasTexture(canvas);
  ctx.clearRect(0, 0, 512, 192);
  ctx.fillStyle = "rgba(7, 9, 14, 0.78)";
  ctx.strokeStyle = alert ? "#e15b64" : "#2a3848";
  ctx.lineWidth = 6;
  roundRect(ctx, 8, 16, 496, 160, 28);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#e7eef6";
  ctx.font = "600 54px Outfit, sans-serif";
  ctx.fillText(name, 256, 78);
  ctx.fillStyle = "#8d9aab";
  ctx.font = "500 32px Outfit, sans-serif";
  ctx.fillText(role.replace(" AI", ""), 256, 122);
  ctx.fillStyle = alert ? "#e15b64" : "#3ec5ff";
  ctx.font = "600 26px Outfit, sans-serif";
  ctx.fillText(statusLabel(status as EmployeeStatus), 256, 158);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function EmployeeStatusBubble({
  name,
  role,
  status,
}: {
  name: string;
  role: string;
  status: EmployeeStatus;
}) {
  const texture = useMemo(() => labelTexture(name, role, status, status === "failed"), [name, role, status]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={[0, 1.95, 0]} scale={[1.35, 0.5, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}
