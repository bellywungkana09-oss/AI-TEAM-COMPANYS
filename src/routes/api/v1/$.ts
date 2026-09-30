import { createFileRoute } from "@tanstack/react-router";
import { handleCompanyApi } from "@/lib/company/api";

const handle = ({ request }: { request: Request }) => handleCompanyApi(request);

export const Route = createFileRoute("/api/v1/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
