import { createFileRoute } from "@tanstack/react-router";
import { VirtualOffice } from "@/components/virtual-office/VirtualOffice";

export const Route = createFileRoute("/")({
  component: VirtualOffice,
});
