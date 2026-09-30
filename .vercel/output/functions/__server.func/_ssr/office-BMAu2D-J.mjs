import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@react-three/fiber+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/office-BMAu2D-J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommandComposer({ onSubmit }) {
	const [value, setValue] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "command-form",
		onSubmit: async (event) => {
			event.preventDefault();
			const command = value.trim();
			if (!command || pending) return;
			setPending(true);
			try {
				await onSubmit(command);
				setValue("");
			} finally {
				setPending(false);
			}
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "founder-command",
				children: "Instruction for the company"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "founder-command",
				value,
				onChange: (event) => setValue(event.target.value),
				placeholder: "Buat website coffee shop",
				rows: 3
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: "office-primary",
				disabled: pending,
				children: pending ? "Sending" : "Execute command"
			})
		]
	});
}
function statusLabel(status) {
	switch (status) {
		case "idle": return "Available";
		case "assigned": return "Assigned";
		case "working": return "Working";
		case "meeting": return "In meeting";
		case "review": return "Reviewing";
		case "completed": return "Completed";
		case "failed": return "Needs attention";
	}
}
//#endregion
export { statusLabel as n, CommandComposer as t };
