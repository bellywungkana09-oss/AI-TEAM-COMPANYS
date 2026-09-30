import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@react-three/fiber+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as FOUNDER_ID } from "./router-BoQA6ZGB.mjs";
import { n as statusLabel, t as CommandComposer } from "./office-BMAu2D-J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-CRgMAZg6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const [status, setStatus] = (0, import_react.useState)(null);
	const [projects, setProjects] = (0, import_react.useState)([]);
	const [tasks, setTasks] = (0, import_react.useState)([]);
	const [employees, setEmployees] = (0, import_react.useState)([]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const [ceo, setCeo] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function refresh() {
		try {
			const [statusRes, projectRes, taskRes, employeeRes, activityRes] = await Promise.all([
				fetch("/api/v1/company/status"),
				fetch("/api/v1/company/projects"),
				fetch("/api/v1/company/tasks"),
				fetch("/api/v1/company/employees"),
				fetch("/api/v1/company/activity")
			]);
			if (![
				statusRes,
				projectRes,
				taskRes,
				employeeRes,
				activityRes
			].every((item) => item.ok)) throw new Error("status");
			setStatus(await statusRes.json());
			setProjects(await projectRes.json());
			setTasks(await taskRes.json());
			setEmployees(await employeeRes.json());
			setActivity(await activityRes.json());
			setError(null);
		} catch {
			setError("Company link interrupted. Showing the last confirmed status.");
		}
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setError("Company data is not available yet."));
		const timer = window.setInterval(() => {
			refresh().catch(() => setError("Company data is not available yet."));
		}, 2e3);
		return () => window.clearInterval(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "dash",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "dash-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "office-kicker",
					children: "AI Company OS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Founder Command Center" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/virtual-office",
					className: "office-primary",
					children: "Enter virtual office"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "office-alert",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "dash-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "dash-card dash-wide",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandComposer, { onSubmit: async (command) => {
							try {
								const response = await fetch("/api/v1/founder/command", {
									method: "POST",
									headers: {
										"content-type": "application/json",
										"x-founder-id": FOUNDER_ID
									},
									body: JSON.stringify({ command })
								});
								if (!response.ok) {
									setError("Command was not accepted.");
									return;
								}
								setCeo(await response.json());
								setError(null);
								await refresh();
							} catch {
								setError("Command could not reach the company. Nothing was changed.");
							}
						} }), ceo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "office-result",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Alexander opened ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ceo.project })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: ceo.strategy.risk }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: ceo.tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: task.title }, task.title)) })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "dash-metrics",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Employees",
								value: status?.employees_total ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Projects",
								value: status?.projects_total ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Active tasks",
								value: status?.active_tasks ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "System",
								value: status?.system_status ?? "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "dash-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Projects" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "dash-list",
							children: projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: project.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								project.status,
								" · ",
								project.progress,
								"%"
							] })] }, project.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "dash-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Employees" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "dash-list",
							children: employees.map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [statusLabel(employee.status), employee.current_task ? ` · ${employee.current_task}` : ""] })] }, employee.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "dash-card dash-wide",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tasks" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "dash-list",
							children: tasks.slice(0, 8).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: task.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								task.assigned_employee ?? "Unassigned",
								" · ",
								task.status
							] })] }, task.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "dash-card dash-wide",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Live activity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "dash-list",
							children: activity.slice(0, 8).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.event.replaceAll("_", " ") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.description })] }, item.id))
						})]
					})
				]
			})
		]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "dash-metric",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: value })]
	});
}
//#endregion
export { Dashboard as component };
