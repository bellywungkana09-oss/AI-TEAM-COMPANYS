import {
  readActivity,
  readEmployees,
  readEvents,
  readOfficeState,
  readProjects,
  readStatus,
  readTasks,
  submitCommand,
} from "./world.server.ts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function handleCompanyApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const method = request.method.toUpperCase();

  try {
    if (method === "GET" && path.endsWith("/company/employees")) return json(readEmployees());
    if (method === "GET" && path.endsWith("/company/status")) return json(readStatus());
    if (method === "GET" && path.endsWith("/company/projects")) return json(readProjects());
    if (method === "GET" && path.endsWith("/company/tasks")) return json(readTasks());
    if (method === "GET" && path.endsWith("/company/activity")) return json(readActivity());
    if (method === "GET" && path.endsWith("/company/events")) {
      const since = Number(url.searchParams.get("since") ?? "0");
      return json({ events: readEvents(Number.isFinite(since) ? since : 0) });
    }
    if (method === "GET" && path.endsWith("/virtual-office/state")) return json(readOfficeState());
    if (method === "POST" && path.endsWith("/founder/command")) {
      let body: { command?: string } = {};
      try {
        body = (await request.json()) as { command?: string };
      } catch {
        return json({ error: { code: "invalid_json", message: "Invalid JSON" } }, 400);
      }
      const founder = request.headers.get("x-founder-id");
      const result = submitCommand(String(body.command ?? ""), founder);
      return json(result.body, result.status);
    }
    return json({ error: { code: "not_found", message: "Unknown company route" } }, 404);
  } catch (error) {
    console.error("[company] api failed", error);
    return json({ error: { code: "internal_server_error", message: "An unexpected error occurred." } }, 500);
  }
}
