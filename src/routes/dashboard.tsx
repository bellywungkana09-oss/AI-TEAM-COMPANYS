import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CommandComposer } from "@/components/command-center/CommandComposer";
import { FOUNDER_ID } from "@/lib/company/world";
import type { Activity, CompanyStatus, Employee, FounderCommandResult, Project, Task } from "@/types/company";
import { statusLabel } from "@/types/office";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [status, setStatus] = useState<CompanyStatus | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [ceo, setCeo] = useState<FounderCommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [statusRes, projectRes, taskRes, employeeRes, activityRes] = await Promise.all([
        fetch("/api/v1/company/status"),
        fetch("/api/v1/company/projects"),
        fetch("/api/v1/company/tasks"),
        fetch("/api/v1/company/employees"),
        fetch("/api/v1/company/activity"),
      ]);
      if (![statusRes, projectRes, taskRes, employeeRes, activityRes].every((item) => item.ok)) {
        throw new Error("status");
      }
      setStatus((await statusRes.json()) as CompanyStatus);
      setProjects((await projectRes.json()) as Project[]);
      setTasks((await taskRes.json()) as Task[]);
      setEmployees((await employeeRes.json()) as Employee[]);
      setActivity((await activityRes.json()) as Activity[]);
      setError(null);
    } catch {
      setError("Company link interrupted. Showing the last confirmed status.");
    }
  }

  useEffect(() => {
    refresh().catch(() => setError("Company data is not available yet."));
    const timer = window.setInterval(() => {
      refresh().catch(() => setError("Company data is not available yet."));
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <p className="office-kicker">AI Company OS</p>
          <h1>Founder Command Center</h1>
        </div>
        <Link to="/virtual-office" className="office-primary">
          Enter virtual office
        </Link>
      </header>
      {error && <p className="office-alert">{error}</p>}
      <section className="dash-grid">
        <div className="dash-card dash-wide">
          <CommandComposer
            onSubmit={async (command) => {
              try {
                const response = await fetch("/api/v1/founder/command", {
                  method: "POST",
                  headers: { "content-type": "application/json", "x-founder-id": FOUNDER_ID },
                  body: JSON.stringify({ command }),
                });
                if (!response.ok) {
                  setError("Command was not accepted.");
                  return;
                }
                setCeo((await response.json()) as FounderCommandResult);
                setError(null);
                await refresh();
              } catch {
                setError("Command could not reach the company. Nothing was changed.");
              }
            }}
          />
          {ceo && (
            <div className="office-result">
              <p>
                Alexander opened <strong>{ceo.project}</strong>
              </p>
              <p>{ceo.strategy.risk}</p>
              <ul>
                {ceo.tasks.map((task) => (
                  <li key={task.title}>{task.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="dash-metrics">
          <Metric label="Employees" value={status?.employees_total ?? "—"} />
          <Metric label="Projects" value={status?.projects_total ?? "—"} />
          <Metric label="Active tasks" value={status?.active_tasks ?? "—"} />
          <Metric label="System" value={status?.system_status ?? "—"} />
        </div>
        <article className="dash-card">
          <h2>Projects</h2>
          <ul className="dash-list">
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.name}</strong>
                <span>
                  {project.status} · {project.progress}%
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="dash-card">
          <h2>Employees</h2>
          <ul className="dash-list">
            {employees.map((employee) => (
              <li key={employee.id}>
                <strong>{employee.name}</strong>
                <span>
                  {statusLabel(employee.status)}
                  {employee.current_task ? ` · ${employee.current_task}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="dash-card dash-wide">
          <h2>Tasks</h2>
          <ul className="dash-list">
            {tasks.slice(0, 8).map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>
                  {task.assigned_employee ?? "Unassigned"} · {task.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="dash-card dash-wide">
          <h2>Live activity</h2>
          <ul className="dash-list">
            {activity.slice(0, 8).map((item) => (
              <li key={item.id}>
                <strong>{item.event.replaceAll("_", " ")}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="dash-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
