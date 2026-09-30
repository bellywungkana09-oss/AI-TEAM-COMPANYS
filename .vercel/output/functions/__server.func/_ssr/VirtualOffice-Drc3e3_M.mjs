import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react, M as Vector3, c as CanvasTexture, i as useThree, r as useFrame, t as Canvas, w as SRGBColorSpace } from "../_libs/@react-three/fiber+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ROOMS, c as approachPoint, d as poseFor, f as resolveWalls, h as workYaw, i as FOUNDER_SPAWN, l as deskPoint, m as wallsFor, n as FOUNDER_ID, o as ROSTER, p as visitPoint, r as ACCENT, s as animationFor, u as officeWalls } from "./router-BoQA6ZGB.mjs";
import { n as statusLabel, t as CommandComposer } from "./office-BMAu2D-J.mjs";
import { n as MotionConfig, t as motion } from "../_libs/framer-motion+[...].mjs";
import { n as EffectComposer, t as Bloom } from "../_libs/@react-three/postprocessing+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/VirtualOffice-Drc3e3_M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var pose = {
	x: FOUNDER_SPAWN.x,
	z: FOUNDER_SPAWN.z,
	yaw: FOUNDER_SPAWN.yaw,
	speed: 0,
	nearCeo: false
};
var listeners = /* @__PURE__ */ new Set();
var notifyQueued = false;
function publishFounder(next) {
	if (Math.abs(next.x - pose.x) < .05 && Math.abs(next.z - pose.z) < .05 && Math.abs(next.yaw - pose.yaw) < .03 && Math.abs(next.speed - pose.speed) < .05 && next.nearCeo === pose.nearCeo) return;
	pose = next;
	if (notifyQueued) return;
	notifyQueued = true;
	requestAnimationFrame(() => {
		notifyQueued = false;
		listeners.forEach((listener) => listener());
	});
}
function getFounderPose() {
	return pose;
}
function useFounderPose() {
	return (0, import_react.useSyncExternalStore)((listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}, getFounderPose, getFounderPose);
}
var KNOWN_EMPLOYEES = new Set(ROSTER.map((person) => person.id));
var VALID_STATUSES = /* @__PURE__ */ new Set([
	"idle",
	"assigned",
	"working",
	"meeting",
	"review",
	"completed",
	"failed"
]);
var TRACKED_EVENTS = /* @__PURE__ */ new Set([
	"employee_status_changed",
	"task_assigned",
	"task_completed",
	"meeting_started",
	"project_phase_changed",
	"company_status_changed"
]);
/**
* Snapshot is the source of truth.
* A newer in-flight request wins over an older one.
* Same epoch + lower seq is stale (events or a newer snapshot already moved the cursor).
* A higher epoch is a server restart and replaces local state.
* A lower epoch after we have locked one is an in-flight response from before the restart.
*/
function shouldAcceptSnapshot(cursor, incoming, requestId, latestRequestId) {
	if (!Number.isFinite(incoming.epoch) || !Number.isFinite(incoming.seq)) return "reject-stale";
	if (requestId !== latestRequestId) return "reject-superseded";
	if (cursor.epoch === 0) return "accept";
	if (incoming.epoch !== cursor.epoch) {
		if (incoming.epoch < cursor.epoch) return "reject-stale";
		return "reset";
	}
	if (incoming.seq < cursor.seq) return "reject-stale";
	return "accept";
}
function isRecord(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function validateCompanyEvent(input) {
	if (!isRecord(input)) return null;
	const type = input.type;
	const seq = input.seq;
	if (typeof type !== "string" || !TRACKED_EVENTS.has(type)) return null;
	if (typeof seq !== "number" || !Number.isFinite(seq)) return null;
	if (input.epoch != null && (typeof input.epoch !== "number" || !Number.isFinite(input.epoch))) return null;
	const data = input.data;
	if (!isRecord(data)) return null;
	if (type === "company_status_changed" || type === "project_phase_changed") return input;
	if (type === "meeting_started") {
		const ids = data.employee_ids;
		if (!Array.isArray(ids) || ids.length === 0) return null;
		if (ids.some((id) => typeof id !== "string" || !KNOWN_EMPLOYEES.has(id))) return null;
		return input;
	}
	const employeeId = data.employee_id;
	if (typeof employeeId !== "string" || !KNOWN_EMPLOYEES.has(employeeId)) return null;
	if (type === "employee_status_changed") {
		if (typeof data.status !== "string" || !VALID_STATUSES.has(data.status)) return null;
		if (data.current_task != null && typeof data.current_task !== "string") return null;
	} else if (data.task != null && typeof data.task !== "string") return null;
	return input;
}
function createEventGate() {
	let epoch = 0;
	const seen = /* @__PURE__ */ new Set();
	return {
		noteEpoch(next) {
			if (!Number.isFinite(next) || next === epoch) return;
			epoch = next;
			seen.clear();
		},
		epoch() {
			return epoch;
		},
		consider(input) {
			const event = validateCompanyEvent(input);
			if (!event) return "invalid";
			if (event.epoch && epoch && event.epoch < epoch) return "stale-epoch";
			if (event.epoch && event.epoch !== epoch) {
				epoch = event.epoch;
				seen.clear();
			}
			if (event.type === "company_status_changed") return "hello";
			if (event.seq > 0) {
				if (seen.has(event.seq)) return "duplicate";
				seen.add(event.seq);
				if (seen.size > 400) {
					const keep = [...seen].sort((a, b) => a - b).slice(-200);
					seen.clear();
					for (const value of keep) seen.add(value);
				}
			}
			return "apply";
		}
	};
}
function paint(employee, status, task) {
	const pose = poseFor(employee.id, status);
	return {
		...employee,
		status,
		current_task: task,
		position: pose.position,
		facing: pose.facing,
		animation: animationFor(employee.name, status, false)
	};
}
/** Apply one validated event. Invalid input returns the list unchanged. */
function reduceEmployees(employees, input) {
	const event = validateCompanyEvent(input);
	if (!event || event.type === "company_status_changed" || event.type === "project_phase_changed") return employees;
	if (event.type === "meeting_started") {
		const ids = new Set(event.data.employee_ids ?? []);
		const topic = typeof event.data.topic === "string" ? event.data.topic : "Floor sync";
		return employees.map((employee) => ids.has(employee.id) ? paint(employee, "meeting", topic) : employee);
	}
	const id = String(event.data.employee_id ?? "");
	return employees.map((employee) => {
		if (employee.id !== id) return employee;
		if (event.type === "employee_status_changed") {
			const status = event.data.status;
			return paint(employee, status, typeof event.data.current_task === "string" ? event.data.current_task : employee.current_task);
		}
		if (event.type === "task_assigned") return paint(employee, "assigned", typeof event.data.task === "string" ? event.data.task : employee.current_task);
		if (event.type === "task_completed") return paint(employee, "completed", typeof event.data.task === "string" ? event.data.task : employee.current_task);
		return employee;
	});
}
/**
* Event stream is a fast path only.
* The caller owns the snapshot cursor; events from an older epoch or a seq
* already covered by the snapshot are ignored. Invalid payloads never apply.
*/
function useCompanyEvents(onEvent, cursorRef) {
	const [connected, setConnected] = (0, import_react.useState)(false);
	const handler = (0, import_react.useRef)(onEvent);
	handler.current = onEvent;
	const cursor = (0, import_react.useRef)(cursorRef);
	cursor.current = cursorRef;
	(0, import_react.useEffect)(() => {
		let stopped = false;
		let since = 0;
		let socket = null;
		let retry = 0;
		let attempts = 0;
		const gate = createEventGate();
		const take = (input) => {
			const current = cursor.current.current;
			gate.noteEpoch(current.epoch);
			const decision = gate.consider(input);
			if (decision === "invalid" || decision === "duplicate" || decision === "stale-epoch") return;
			const event = input;
			if (event.seq > 0) since = Math.max(since, event.seq);
			if (event.epoch && current.epoch && event.epoch !== current.epoch) return;
			if (event.seq > 0 && current.epoch && event.epoch === current.epoch && event.seq <= current.seq) return;
			if (decision === "hello") {
				setConnected(true);
				return;
			}
			handler.current(event);
		};
		const poll = async () => {
			try {
				const response = await fetch(`/api/v1/company/events?since=${since}`, { cache: "no-store" });
				if (!response.ok) {
					setConnected(false);
					return;
				}
				const body = await response.json();
				if (!body || !Array.isArray(body.events)) return;
				setConnected(true);
				attempts = 0;
				for (const event of body.events) take(event);
			} catch {
				setConnected(false);
			}
		};
		const connect = () => {
			if (stopped) return;
			if (typeof WebSocket === "undefined") return;
			const protocol = window.location.protocol === "https:" ? "wss" : "ws";
			try {
				socket = new WebSocket(`${protocol}://${window.location.host}/ws/company`);
			} catch {
				setConnected(false);
				return;
			}
			socket.onopen = () => setConnected(true);
			socket.onmessage = (message) => {
				try {
					take(JSON.parse(String(message.data)));
				} catch {}
			};
			socket.onerror = () => {};
			socket.onclose = () => {
				if (stopped) return;
				attempts += 1;
				const delay = Math.min(12e3, 1500 * Math.max(1, attempts));
				retry = window.setTimeout(connect, delay);
			};
		};
		poll();
		const timer = window.setInterval(() => void poll(), 1200);
		connect();
		return () => {
			stopped = true;
			window.clearInterval(timer);
			window.clearTimeout(retry);
			socket?.close();
		};
	}, []);
	return connected;
}
function fallbackState() {
	const employees = ROSTER.map((person) => {
		const status = person.id === "emma" ? "review" : person.id === "alexander" ? "idle" : "working";
		const pose = poseFor(person.id, status);
		return {
			id: person.id,
			name: person.name,
			role: person.role,
			department: person.department,
			status,
			current_task: null,
			skills: person.skills,
			room_id: person.room_id,
			position: pose.position,
			facing: pose.facing,
			animation: animationFor(person.name, status, false)
		};
	});
	return {
		epoch: 0,
		seq: 0,
		office: { rooms: ROOMS },
		employees
	};
}
function useVirtualOffice() {
	const [state, setState] = (0, import_react.useState)(() => fallbackState());
	const [feed, setFeed] = (0, import_react.useState)([]);
	const [commandResult, setCommandResult] = (0, import_react.useState)(null);
	const [commandError, setCommandError] = (0, import_react.useState)(null);
	const [linkError, setLinkError] = (0, import_react.useState)(null);
	const cursorRef = (0, import_react.useRef)({
		epoch: 0,
		seq: 0
	});
	const requestRef = (0, import_react.useRef)(0);
	const refresh = (0, import_react.useCallback)(async () => {
		const requestId = ++requestRef.current;
		let response;
		try {
			response = await fetch("/api/v1/virtual-office/state", { cache: "no-store" });
		} catch {
			setLinkError("Floor link interrupted. Showing the last confirmed snapshot.");
			return;
		}
		if (requestId !== requestRef.current) return;
		if (!response.ok) {
			setLinkError("Floor snapshot unavailable. Retrying from the last good state.");
			return;
		}
		let body;
		try {
			body = await response.json();
		} catch {
			setLinkError("Floor snapshot was unreadable. Keeping the current floor.");
			return;
		}
		if (!body?.office || !Array.isArray(body.employees)) {
			setLinkError("Floor snapshot was incomplete. Keeping the current floor.");
			return;
		}
		const decision = shouldAcceptSnapshot(cursorRef.current, {
			epoch: Number(body.epoch ?? 0),
			seq: Number(body.seq ?? 0)
		}, requestId, requestRef.current);
		if (decision === "reject-stale" || decision === "reject-superseded") return;
		const nextEpoch = Number(body.epoch ?? 0);
		const nextSeq = Number(body.seq ?? 0);
		cursorRef.current = {
			epoch: nextEpoch,
			seq: nextSeq
		};
		setLinkError(null);
		setState({
			...body,
			epoch: nextEpoch,
			seq: nextSeq,
			office: { rooms: body.office.rooms ?? ROOMS }
		});
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
		const timer = window.setInterval(() => void refresh(), 4e3);
		return () => window.clearInterval(timer);
	}, [refresh]);
	return {
		state,
		feed,
		connected: useCompanyEvents((event) => {
			const cursor = cursorRef.current;
			if (event.epoch && cursor.epoch && event.epoch !== cursor.epoch) return;
			if (event.seq > cursor.seq) cursorRef.current = {
				epoch: event.epoch || cursor.epoch,
				seq: event.seq
			};
			setFeed((current) => [event, ...current].slice(0, 8));
			setState((current) => ({
				...current,
				seq: Math.max(current.seq, event.seq),
				employees: reduceEmployees(current.employees, event)
			}));
			if (event.type === "project_phase_changed" || event.type === "meeting_started") refresh();
		}, cursorRef),
		commandResult,
		commandError,
		linkError,
		sendCommand: (0, import_react.useCallback)(async (command) => {
			setCommandError(null);
			let response;
			try {
				response = await fetch("/api/v1/founder/command", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						"x-founder-id": FOUNDER_ID
					},
					body: JSON.stringify({ command })
				});
			} catch {
				setCommandError("The company could not be reached. Nothing was changed.");
				return;
			}
			if (!response.ok) {
				setCommandError("Alexander could not record that command.");
				return;
			}
			try {
				const body = await response.json();
				setCommandResult(body);
			} catch {
				setCommandError("Alexander answered, but the plan could not be read.");
			}
			await refresh();
		}, [refresh]),
		refresh
	};
}
var WALLS = officeWalls();
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function wrapPi(angle) {
	return Math.atan2(Math.sin(angle), Math.cos(angle));
}
function axesFromInput(keys, touch) {
	let steer = 0;
	let throttle = 0;
	if (keys.has("KeyA") || keys.has("ArrowLeft")) steer += 1;
	if (keys.has("KeyD") || keys.has("ArrowRight")) steer -= 1;
	if (keys.has("KeyW") || keys.has("ArrowUp")) throttle += 1;
	if (keys.has("KeyS") || keys.has("ArrowDown")) throttle -= 1;
	if (steer === 0 && throttle === 0) {
		steer = touch.steer;
		throttle = touch.throttle;
	}
	return {
		steer: clamp(steer, -1, 1),
		throttle: clamp(throttle, -1, 1)
	};
}
/**
* On-foot founder. yaw 0 faces world −Z.
* A / left increases yaw (nose turns left under the chase camera).
* D / right decreases yaw.
*/
function stepWalker(walker, keys, touch, autopilot, dt, walls = WALLS) {
	const delta = Math.min(Math.max(dt, 0), .1);
	let { steer, throttle } = axesFromInput(keys, touch);
	let dropAutopilot = false;
	if (steer === 0 && throttle === 0 && autopilot && keys.size === 0) {
		const dx = autopilot.x - walker.x;
		const dz = autopilot.z - walker.z;
		if (Math.hypot(dx, dz) < .55) dropAutopilot = true;
		else {
			const diff = wrapPi(Math.atan2(-dx, -dz) - walker.yaw);
			steer = clamp(diff * 2.4, -1, 1);
			throttle = Math.abs(diff) < .9 ? 1 : .4;
		}
	}
	const turnRate = 2.35;
	let speed = walker.speed + throttle * 9 * delta;
	if (throttle === 0) {
		const drag = 8 * delta;
		if (Math.abs(speed) <= drag) speed = 0;
		else speed -= Math.sign(speed) * drag;
	}
	speed = clamp(speed, -2.4, 4.4);
	const moving = Math.abs(speed) > .08 || Math.abs(throttle) > 0;
	const speedFactor = Math.min(1, Math.abs(speed) / 1.15);
	const reverse = speed >= 0 ? 1 : -1;
	const yaw = walker.yaw + steer * turnRate * (moving ? Math.max(speedFactor, Math.abs(throttle) > 0 ? .72 : 0) : 0) * reverse * delta;
	const fx = -Math.sin(yaw);
	const fz = -Math.cos(yaw);
	const resolved = resolveWalls(walker.x + fx * speed * delta, walker.z + fz * speed * delta, .34, walls);
	return {
		x: resolved.x,
		z: resolved.z,
		yaw,
		speed: dropAutopilot ? 0 : speed
	};
}
function autopilotCleared(walker, autopilot) {
	if (!autopilot) return false;
	return Math.hypot(autopilot.x - walker.x, autopilot.z - walker.z) < .55 && Math.abs(walker.speed) < .2;
}
var desired = new Vector3();
var look = new Vector3();
function CameraController({ control, alexander }) {
	const { camera, gl } = useThree();
	const body = (0, import_react.useRef)(null);
	const walker = (0, import_react.useRef)({
		x: FOUNDER_SPAWN.x,
		z: FOUNDER_SPAWN.z,
		yaw: FOUNDER_SPAWN.yaw,
		speed: 0
	});
	const intro = (0, import_react.useRef)(0);
	const keys = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const injected = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	const lastX = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const down = (event) => {
			if (event.repeat) return;
			const target = event.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
			if ([
				"KeyW",
				"KeyA",
				"KeyS",
				"KeyD",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(event.code)) event.preventDefault();
			injected.current = null;
			keys.current.add(event.code);
		};
		const up = (event) => keys.current.delete(event.code);
		const blur = () => keys.current.clear();
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		window.addEventListener("blur", blur);
		const probe = {
			getYaw: () => walker.current.yaw,
			getSpeed: () => walker.current.speed,
			setKeys: (codes) => {
				injected.current = new Set(codes);
			},
			setSteer: (value) => {
				control.touch.steer = value;
			}
		};
		window.__controlsTest = probe;
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
			window.removeEventListener("blur", blur);
			if (window.__controlsTest === probe) delete window.__controlsTest;
		};
	}, [control]);
	(0, import_react.useEffect)(() => {
		const canvas = gl.domElement;
		const pointerDown = (event) => {
			if (!control.playing) return;
			dragging.current = true;
			lastX.current = event.clientX;
		};
		const pointerMove = (event) => {
			if (!dragging.current) return;
			const dx = event.clientX - lastX.current;
			lastX.current = event.clientX;
			walker.current.yaw -= dx * .005;
		};
		const pointerUp = () => {
			dragging.current = false;
		};
		canvas.addEventListener("pointerdown", pointerDown);
		window.addEventListener("pointermove", pointerMove);
		window.addEventListener("pointerup", pointerUp);
		return () => {
			canvas.removeEventListener("pointerdown", pointerDown);
			window.removeEventListener("pointermove", pointerMove);
			window.removeEventListener("pointerup", pointerUp);
		};
	}, [gl, control]);
	useFrame((_, delta) => {
		const activeKeys = injected.current ?? keys.current;
		if (!(control.playing || injected.current != null)) {
			intro.current = Math.min(9, intro.current + delta);
			const u = Math.min(1, intro.current / 7.2);
			const ease = u * u * (3 - 2 * u);
			const ang = .2 + ease * 1.15;
			const rad = 13 - ease * 5;
			const y = 7.6 - ease * 4.4;
			const focusZ = 2 - ease * 2;
			camera.position.set(Math.sin(ang) * rad, Math.max(2.5, y), 8.4 + Math.cos(ang) * 3.2);
			camera.lookAt(0, 1.15, focusZ);
			publishFounder({
				x: walker.current.x,
				z: walker.current.z,
				yaw: walker.current.yaw,
				speed: 0,
				nearCeo: false
			});
			return;
		}
		const next = stepWalker(walker.current, activeKeys, control.touch, control.autopilot, delta);
		walker.current = next;
		if (control.autopilot && (activeKeys.size > 0 || autopilotCleared(next, control.autopilot))) control.autopilot = null;
		const { x, z, yaw, speed } = walker.current;
		body.current?.position.set(x, 0, z);
		if (body.current) body.current.rotation.y = Math.PI + yaw;
		const fx = -Math.sin(yaw);
		const fz = -Math.cos(yaw);
		desired.set(x - fx * 4.8, 2.25, z - fz * 4.8);
		const blend = 1 - Math.exp(-5.5 * Math.min(delta, .1));
		camera.position.lerp(desired, blend);
		look.set(x, 1.15, z);
		camera.lookAt(look);
		publishFounder({
			x,
			z,
			yaw,
			speed,
			nearCeo: alexander ? Math.hypot(alexander.x - x, alexander.z - z) < 2.35 : false
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: body,
		position: [
			FOUNDER_SPAWN.x,
			0,
			FOUNDER_SPAWN.z
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.95,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
					.22,
					.7,
					6,
					12
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#1c2430",
					metalness: .35,
					roughness: .4
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.45,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					.16,
					18,
					14
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#d6b36a",
					emissive: "#d6b36a",
					emissiveIntensity: .25
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				position: [
					0,
					.04,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					.34,
					.42,
					24
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#d6b36a",
					transparent: true,
					opacity: .8
				})]
			})
		]
	});
}
function labelTexture(name, role, status, alert) {
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
	ctx.fillText(statusLabel(status), 256, 158);
	const texture = new CanvasTexture(canvas);
	texture.needsUpdate = true;
	return texture;
}
function roundRect(ctx, x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}
function EmployeeStatusBubble({ name, role, status }) {
	const texture = (0, import_react.useMemo)(() => labelTexture(name, role, status, status === "failed"), [
		name,
		role,
		status
	]);
	(0, import_react.useEffect)(() => () => texture.dispose(), [texture]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sprite", {
		position: [
			0,
			1.95,
			0
		],
		scale: [
			1.35,
			.5,
			1
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("spriteMaterial", {
			map: texture,
			transparent: true,
			depthWrite: false
		})
	});
}
function EmployeeAvatar({ name, role, status, accent, animation, position, facing, selected, onSelect }) {
	const root = (0, import_react.useRef)(null);
	const leftArm = (0, import_react.useRef)(null);
	const rightArm = (0, import_react.useRef)(null);
	const leftLeg = (0, import_react.useRef)(null);
	const rightLeg = (0, import_react.useRef)(null);
	const head = (0, import_react.useRef)(null);
	const visor = (0, import_react.useRef)(null);
	const spot = (0, import_react.useRef)({
		x: position.x,
		z: position.z,
		facing
	});
	useFrame((state, delta) => {
		const rig = root.current;
		if (!rig) return;
		const dt = Math.min(delta, .1);
		const current = spot.current;
		current.x += (position.x - current.x) * Math.min(1, dt * 2.4);
		current.z += (position.z - current.z) * Math.min(1, dt * 2.4);
		const turn = Math.atan2(Math.sin(facing - current.facing), Math.cos(facing - current.facing));
		current.facing += turn * Math.min(1, dt * 4);
		const anim = Math.hypot(position.x - current.x, position.z - current.z) > .22 ? "walk" : animation === "failed" ? "alert" : animation;
		const t = state.clock.elapsedTime;
		const seated = anim === "working" || anim === "review";
		rig.position.set(current.x, seated ? -.18 : Math.sin(t * 1.6) * .012, current.z);
		rig.rotation.y = Math.PI + current.facing;
		const armL = leftArm.current;
		const armR = rightArm.current;
		const legL = leftLeg.current;
		const legR = rightLeg.current;
		const skull = head.current;
		if (!armL || !armR || !legL || !legR || !skull) return;
		armL.rotation.set(.15, 0, .12);
		armR.rotation.set(.15, 0, -.12);
		legL.rotation.set(0, 0, 0);
		legR.rotation.set(0, 0, 0);
		skull.rotation.set(0, Math.sin(t * .6) * .08, 0);
		const visorMaterial = visor.current?.material;
		if (visorMaterial && !Array.isArray(visorMaterial) && "emissiveIntensity" in visorMaterial) visorMaterial.emissiveIntensity = anim === "alert" ? .7 + Math.sin(t * 8) * .3 : .9;
		if (anim === "walk") {
			const step = Math.sin(t * 8);
			legL.rotation.x = step * .55;
			legR.rotation.x = -step * .55;
			armL.rotation.x = -step * .4;
			armR.rotation.x = step * .4;
		} else if (anim === "working") {
			armL.rotation.x = -1.05 + Math.sin(t * 11) * .18;
			armR.rotation.x = -1.05 + Math.sin(t * 11 + 1.2) * .18;
			skull.rotation.x = .32;
		} else if (anim === "review") {
			armL.rotation.x = -.75;
			armR.rotation.x = -.9;
			skull.rotation.x = .4;
		} else if (anim === "meeting") {
			armR.rotation.x = -.85 + Math.sin(t * 2.2) * .28;
			armR.rotation.z = -.2;
			skull.rotation.y = Math.sin(t * 1.1) * .25;
		} else if (anim === "thinking") {
			armR.rotation.x = -1.4;
			armR.rotation.z = -.4;
			skull.rotation.x = -.08 + Math.sin(t * .8) * .05;
		} else if (anim === "alert") {
			rig.position.x += Math.sin(t * 16) * .01;
			skull.rotation.x = .12;
		} else if (anim === "completed") {
			skull.rotation.x = Math.max(0, Math.sin(t * 1.4)) * .22;
			armR.rotation.x = -.4;
		}
	});
	const shell = "#1a2030";
	const plate = "#2c3548";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: root,
		onClick: (event) => {
			event.stopPropagation();
			onSelect();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				position: [
					0,
					.03,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					.32,
					selected ? .48 : .4,
					28
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: status === "failed" ? "#e15b64" : accent,
					transparent: true,
					opacity: selected ? .95 : .45
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: leftLeg,
				position: [
					-.11,
					.78,
					0
				],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.22,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.055,
						.28,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: shell,
						metalness: .45,
						roughness: .4
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: rightLeg,
				position: [
					.11,
					.78,
					0
				],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.22,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.055,
						.28,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: shell,
						metalness: .45,
						roughness: .4
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.08,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.42,
					.5,
					.24
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: plate,
					metalness: .62,
					roughness: .28
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.14,
					.12
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.16,
					.1,
					.03
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: accent,
					emissive: accent,
					emissiveIntensity: .9,
					toneMapped: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.32,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.5,
					.06,
					.28
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#121722",
					metalness: .7,
					roughness: .3
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: leftArm,
				position: [
					-.28,
					1.26,
					0
				],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.2,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.04,
						.28,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: plate,
						metalness: .5,
						roughness: .35
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
				ref: rightArm,
				position: [
					.28,
					1.26,
					0
				],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-.2,
						0
					],
					castShadow: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [
						.04,
						.28,
						4,
						8
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: plate,
						metalness: .5,
						roughness: .35
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
				ref: head,
				position: [
					0,
					1.58,
					0
				],
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						castShadow: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
							.145,
							20,
							16
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: "#12151c",
							metalness: .72,
							roughness: .22
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						ref: visor,
						position: [
							0,
							.01,
							.09
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.16,
							.05,
							.04
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: accent,
							emissive: accent,
							emissiveIntensity: .9,
							toneMapped: false
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
						position: [
							0,
							.1,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
							.16,
							.03,
							.16
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: accent,
							emissive: accent,
							emissiveIntensity: .35
						})]
					})
				]
			}),
			(animation === "review" || status === "review") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					.16,
					1.05,
					.22
				],
				rotation: [
					-.7,
					.2,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.18,
					.12,
					.012
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#071018",
					emissive: accent,
					emissiveIntensity: .7,
					toneMapped: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeStatusBubble, {
				name,
				role,
				status
			})
		]
	});
}
var ROOM_COLOR = {
	ceo: "#d6b36a",
	technology: "#3ec5ff",
	product: "#ff8a3d",
	design: "#b07cff",
	development: "#3dffe8",
	qa: "#3dff9a",
	meeting: "#e7d7a8"
};
function panelTexture(title, lines, accent) {
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
function Neon({ x1, z1, x2, z2, color }) {
	const dx = x2 - x1;
	const dz = z2 - z1;
	const len = Math.max(.2, Math.hypot(dx, dz));
	const rot = Math.atan2(dx, dz);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			(x1 + x2) / 2,
			.03,
			(z1 + z2) / 2
		],
		rotation: [
			0,
			rot,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
			.06,
			.012,
			len
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color,
			toneMapped: false
		})]
	});
}
function Headquarters() {
	const core = (0, import_react.useRef)(null);
	const ring = (0, import_react.useRef)(null);
	const motes = (0, import_react.useRef)(null);
	const brief = (0, import_react.useMemo)(() => panelTexture("AI COMPANY", [
		"Headquarters online",
		"Six seats on the floor",
		"Founder has the bridge"
	], "#d6b36a"), []);
	const live = (0, import_react.useMemo)(() => panelTexture("FLOOR LINK", [
		"Snapshot is truth",
		"Events are the fast path",
		"Commands stay with Alexander"
	], "#3ec5ff"), []);
	(0, import_react.useEffect)(() => () => {
		brief.dispose();
		live.dispose();
	}, [brief, live]);
	const specks = (0, import_react.useMemo)(() => {
		const count = 42;
		const positions = /* @__PURE__ */ new Float32Array(126);
		for (let i = 0; i < count; i += 1) {
			const angle = i / count * Math.PI * 2;
			const radius = .85 + i % 5 * .22;
			positions[i * 3] = Math.cos(angle) * radius;
			positions[i * 3 + 1] = .6 + i % 7 * .28;
			positions[i * 3 + 2] = Math.sin(angle) * radius * .72;
		}
		return positions;
	}, []);
	useFrame((_, delta) => {
		if (core.current) core.current.rotation.y += delta * .4;
		if (ring.current) ring.current.rotation.z += delta * .6;
		if (motes.current) motes.current.rotation.y -= delta * .15;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				0,
				0
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [48, 50] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#1a2633",
				metalness: .45,
				roughness: .38
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				0,
				.012,
				4.2
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [6.4, 64] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#243246",
				metalness: .35,
				roughness: .4
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("gridHelper", {
			args: [
				40,
				40,
				"#163044",
				"#101820"
			],
			position: [
				0,
				.018,
				0
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Neon, {
			x1: 0,
			z1: -19,
			x2: 0,
			z2: 18,
			color: "#d6b36a"
		}),
		ROOMS.filter((room) => room.id !== "meeting").map((room) => {
			const door = approachPoint(room);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Neon, {
				x1: door.x,
				z1: door.z,
				x2: 0,
				z2: door.z,
				color: ROOM_COLOR[room.id] ?? "#3ec5ff"
			}, room.id);
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: [
				0,
				0,
				4.15
			],
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.08,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.72,
						.9,
						.12,
						6
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: "#141820",
						metalness: .8,
						roughness: .25
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						.16,
						0
					],
					rotation: [
						-Math.PI / 2,
						0,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
						.78,
						.86,
						48
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
						color: "#d6b36a",
						toneMapped: false
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
					ref: core,
					position: [
						0,
						1.35,
						0
					],
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.42, 1] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
							color: "#d6b36a",
							emissive: "#d6b36a",
							emissiveIntensity: .85,
							metalness: .4,
							roughness: .2,
							toneMapped: false
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("icosahedronGeometry", { args: [.62, 1] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
							color: "#3ec5ff",
							wireframe: true,
							transparent: true,
							opacity: .85,
							toneMapped: false
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
							ref: ring,
							rotation: [
								Math.PI / 2.4,
								0,
								0
							],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
								.78,
								.015,
								8,
								48
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
								color: "#d6b36a",
								toneMapped: false
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
					ref: motes,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("points", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferGeometry", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
						attach: "attributes-position",
						args: [specks, 3]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
						color: "#e7eef6",
						size: .035,
						transparent: true,
						opacity: .75,
						depthWrite: false
					})] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
					position: [
						0,
						1.6,
						0
					],
					color: "#d6b36a",
					intensity: 4,
					distance: 8
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-4.35,
				1.45,
				5.35
			],
			rotation: [
				0,
				.5,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [1.7, 1.05] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: brief,
				emissive: "#d6b36a",
				emissiveIntensity: .18,
				toneMapped: false
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				4.35,
				1.45,
				5.35
			],
			rotation: [
				0,
				-.5,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [1.7, 1.05] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				map: live,
				emissive: "#3ec5ff",
				emissiveIntensity: .18,
				toneMapped: false
			})]
		})
	] });
}
function Desk({ room, active }) {
	const screen = (0, import_react.useRef)(null);
	const spot = deskPoint(room);
	const yaw = workYaw(room);
	const accent = ROOM_COLOR[room.id] ?? (room.accent === "gold" ? ACCENT.gold : ACCENT.blue);
	useFrame((state) => {
		const material = screen.current?.material;
		if (!material || Array.isArray(material) || !("emissiveIntensity" in material)) return;
		material.emissiveIntensity = active ? .7 + Math.sin(state.clock.elapsedTime * 3) * .25 : .18;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			spot.x,
			0,
			spot.z
		],
		rotation: [
			0,
			yaw,
			0
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.74,
					0
				],
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					1.35,
					.06,
					.62
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#1c2430",
					metalness: .72,
					roughness: .22
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					-.55,
					.38,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.06,
					.7,
					.5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#12171e" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					.55,
					.38,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.06,
					.7,
					.5
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#12171e" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.78,
					.16
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.42,
					.02,
					.16
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#0c1016" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.08,
					-.18
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.72,
					.46,
					.04
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#0a0e13",
					metalness: .6,
					roughness: .25
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				ref: screen,
				position: [
					0,
					1.08,
					-.15
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [.62, .36] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: accent,
					emissive: accent,
					emissiveIntensity: .4,
					toneMapped: false
				})]
			})
		]
	});
}
function Panel({ position, rotation, color, args }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position,
		rotation,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: "#070c12",
			emissive: color,
			emissiveIntensity: .55,
			toneMapped: false
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				0,
				-.02
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				args[0] + .06,
				args[1] + .06,
				.03
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#121820",
				metalness: .7,
				roughness: .28
			})]
		})]
	});
}
function RoomDressing({ room }) {
	const color = ROOM_COLOR[room.id] ?? "#3ec5ff";
	const base = [
		room.x,
		0,
		room.z
	];
	if (room.id === "ceo") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: base,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.78,
					-1.15
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					1.15,
					1.15,
					.06,
					32
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#1a1712",
					metalness: .62,
					roughness: .22
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.84,
					-1.15
				],
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					.35,
					.95,
					32
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color,
					transparent: true,
					opacity: .8,
					toneMapped: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				position: [
					0,
					1.7,
					-3.55
				],
				color,
				args: [3.2, 1.15]
			}),
			[
				-1.1,
				-.2,
				.7
			].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					x,
					1.55,
					-3.5
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.55,
					.08,
					.01
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color,
					toneMapped: false
				})]
			}, x))
		]
	});
	if (room.id === "technology") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: base,
		children: [[-1.6, -.7].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position: [
				x,
				0,
				-2.4
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.05,
					0
				],
				castShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.7,
					1.9,
					.4
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#121820",
					metalness: .55,
					roughness: .35
				})]
			}), [
				.4,
				.9,
				1.4
			].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					y,
					.21
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.5,
					.06,
					.01
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color,
					toneMapped: false
				})]
			}, y))]
		}, x)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			position: [
				2.6,
				1.5,
				0
			],
			rotation: [
				0,
				-Math.PI / 2,
				0
			],
			color,
			args: [2.2, 1.1]
		})]
	});
	if (room.id === "product") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: base,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				position: [
					0,
					1.65,
					-3.2
				],
				color,
				args: [3.4, 1.3]
			}),
			[
				-1.2,
				0,
				1.2
			].map((x, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					x,
					1.15 + index * .15,
					-3.1
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.85,
					.12,
					.02
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color,
					transparent: true,
					opacity: .85,
					toneMapped: false
				})]
			}, x)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.15,
					.4
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					1.4,
					.9,
					.04
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#100c0a",
					emissive: color,
					emissiveIntensity: .35,
					toneMapped: false
				})]
			})
		]
	});
	if (room.id === "design") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: base,
		children: [[
			-.7,
			.15,
			.95
		].map((x, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				x,
				1.35,
				-1.6
			],
			rotation: [
				0,
				.2 - index * .2,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.7,
				1.05,
				.04
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#140e1c",
				emissive: color,
				emissiveIntensity: .4,
				toneMapped: false
			})]
		}, x)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				0,
				.04,
				0
			],
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
				1.3,
				1.38,
				40
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
				color,
				transparent: true,
				opacity: .7,
				toneMapped: false
			})]
		})]
	});
	if (room.id === "development") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: base,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			position: [
				0,
				1.7,
				2.8
			],
			rotation: [
				0,
				Math.PI,
				0
			],
			color,
			args: [2.6, 1.15]
		}), [
			0,
			1,
			2,
			3
		].map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				-1.1 + step * .55,
				1.15,
				1.4
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.38,
				.18 + step * .12,
				.08
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#0c1418",
				emissive: color,
				emissiveIntensity: .45,
				toneMapped: false
			})]
		}, step))]
	});
	if (room.id === "qa") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: base,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			position: [
				0,
				1.6,
				2.9
			],
			rotation: [
				0,
				Math.PI,
				0
			],
			color,
			args: [3.4, 1.2]
		}), [
			-.9,
			0,
			.9
		].map((x, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			position: [
				x,
				.7 + index * .15,
				1.6
			],
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
				.5,
				.5,
				.08
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#0c1410",
				emissive: index === 1 ? "#e15b64" : color,
				emissiveIntensity: .5,
				toneMapped: false
			})]
		}, x))]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			room.x,
			.04,
			room.z
		],
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
			1.7,
			1.78,
			48
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color,
			transparent: true,
			opacity: .55,
			toneMapped: false
		})]
	});
}
function Wall({ box, accent }) {
	const sx = Math.max(.08, box.maxX - box.minX);
	const sz = Math.max(.08, box.maxZ - box.minZ);
	const cx = (box.minX + box.maxX) / 2;
	const cz = (box.minZ + box.maxZ) / 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			cx,
			0,
			cz
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.42,
					0
				],
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					sx,
					.84,
					sz
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#10151d",
					metalness: .55,
					roughness: .32
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					1.78,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					sx,
					1.8,
					sz
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#9fd4ea",
					transparent: true,
					opacity: .1,
					roughness: .05,
					metalness: .15,
					depthWrite: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					2.72,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					sx,
					.035,
					sz
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: accent,
					emissive: accent,
					emissiveIntensity: 1.1,
					toneMapped: false
				})]
			})
		]
	});
}
function OfficeRoom({ room, deskActive }) {
	const accent = ROOM_COLOR[room.id] ?? "#3ec5ff";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
			rotation: [
				-Math.PI / 2,
				0,
				0
			],
			position: [
				room.x,
				.021,
				room.z
			],
			receiveShadow: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [room.w - .28, room.d - .28] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
				color: "#1c2836",
				metalness: .28,
				roughness: .5
			})]
		}),
		wallsFor(room).map((box, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wall, {
			box,
			accent
		}, `${room.id}-${index}`)),
		room.id !== "meeting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {
			room,
			active: deskActive
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomDressing, { room }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomLabel, {
			name: room.name,
			accent,
			position: [
				room.x,
				2.42,
				room.z
			]
		})
	] });
}
function RoomLabel({ name, accent, position }) {
	const texture = (0, import_react.useMemo)(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 96;
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.clearRect(0, 0, 512, 96);
			ctx.fillStyle = "rgba(5, 8, 14, 0.72)";
			ctx.fillRect(24, 16, 464, 64);
			ctx.fillStyle = accent;
			ctx.font = "600 32px Outfit, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(name.toUpperCase(), 256, 58);
		}
		const map = new CanvasTexture(canvas);
		map.colorSpace = SRGBColorSpace;
		map.needsUpdate = true;
		return map;
	}, [accent, name]);
	(0, import_react.useEffect)(() => () => texture.dispose(), [texture]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sprite", {
		position,
		scale: [
			2.5,
			.46,
			1
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("spriteMaterial", {
			map: texture,
			transparent: true,
			depthWrite: false
		})
	});
}
function StatusWall({ employees }) {
	const signature = employees.map((employee) => `${employee.id}:${employee.status}`).join("|");
	const texture = (0, import_react.useMemo)(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 640;
		canvas.height = 360;
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.fillStyle = "#071018";
			ctx.fillRect(0, 0, 640, 360);
			ctx.strokeStyle = "#d6b36a";
			ctx.lineWidth = 4;
			ctx.strokeRect(16, 16, 608, 328);
			ctx.fillStyle = "#d6b36a";
			ctx.font = "600 28px Outfit, sans-serif";
			ctx.fillText("COMPANY FLOOR", 40, 64);
			ctx.font = "500 22px Outfit, sans-serif";
			employees.forEach((employee, index) => {
				const y = 118 + index * 36;
				const accent = ROSTER.find((person) => person.id === employee.id)?.accent ?? "#3ec5ff";
				ctx.fillStyle = employee.status === "failed" ? "#e15b64" : accent;
				ctx.fillRect(40, y - 14, 12, 12);
				ctx.fillStyle = "#e7eef6";
				ctx.fillText(employee.name, 68, y);
				ctx.fillStyle = "#8d9aab";
				ctx.fillText(employee.status, 280, y);
			});
		}
		const map = new CanvasTexture(canvas);
		map.colorSpace = SRGBColorSpace;
		map.anisotropy = 4;
		map.needsUpdate = true;
		return map;
	}, [signature]);
	(0, import_react.useEffect)(() => () => texture.dispose(), [texture]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			1.7,
			2.55
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [2.4, 1.35] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			map: texture,
			emissive: "#d6b36a",
			emissiveIntensity: .2,
			toneMapped: false
		})]
	});
}
function MeetingTable() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			0,
			0,
			-2.1
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.74,
					0
				],
				castShadow: true,
				receiveShadow: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					3.4,
					.07,
					1.4
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#16140f",
					metalness: .72,
					roughness: .22
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.79,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					2.4,
					.012,
					.04
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#d6b36a",
					toneMapped: false
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					0,
					.8,
					0
				],
				rotation: [
					-Math.PI / 2,
					0,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [
					.25,
					.55,
					32
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					color: "#3ec5ff",
					transparent: true,
					opacity: .8,
					toneMapped: false
				})]
			}),
			[-1.4, 1.4].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				position: [
					x,
					.38,
					0
				],
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
					.08,
					.72,
					1.15
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: "#12171e",
					metalness: .4,
					roughness: .45
				})]
			}, x))
		]
	});
}
function FloorBloom() {
	if (useThree((state) => state.size.width) < 900) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectComposer, {
		multisampling: 0,
		enableNormalPass: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bloom, {
			intensity: .28,
			luminanceThreshold: .9,
			mipmapBlur: true,
			radius: .3
		})
	});
}
function OfficeScene({ employees, selectedId, onSelect, control }) {
	const alexander = employees.find((employee) => employee.id === "alexander");
	const accents = Object.fromEntries(ROSTER.map((person) => [person.id, person.accent]));
	const busyRooms = new Set(employees.filter((employee) => [
		"working",
		"review",
		"failed",
		"assigned"
	].includes(employee.status)).map((employee) => employee.room_id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: ["#0b1220"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				"#0b1220",
				28,
				64
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .55 }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", {
			color: "#8fb4d4",
			groundColor: "#1a140c",
			intensity: .55
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				12,
				18,
				6
			],
			intensity: 1.7,
			castShadow: true,
			"shadow-mapSize-width": 1024,
			"shadow-mapSize-height": 1024,
			"shadow-camera-far": 60,
			"shadow-camera-left": -24,
			"shadow-camera-right": 24,
			"shadow-camera-top": 24,
			"shadow-camera-bottom": -24,
			"shadow-bias": -4e-4
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-8,
				6,
				-10
			],
			intensity: .35,
			color: "#d6b36a"
		}),
		ROOMS.map((room) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				room.x,
				2.7,
				room.z
			],
			color: ROOM_COLOR[room.id] ?? "#3ec5ff",
			intensity: 2.4,
			distance: 9,
			decay: 2
		}, room.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headquarters, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusWall, { employees }),
		ROOMS.map((room) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficeRoom, {
			room,
			deskActive: room.id === "meeting" ? employees.some((employee) => employee.status === "meeting") : busyRooms.has(room.id)
		}, room.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingTable, {}),
		employees.map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
			name: employee.name,
			role: employee.role,
			status: employee.status,
			accent: accents[employee.id] ?? "#3ec5ff",
			animation: employee.animation,
			position: employee.position,
			facing: employee.facing,
			selected: selectedId === employee.id,
			onSelect: () => onSelect(employee.id)
		}, employee.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraController, {
			control,
			alexander: alexander ? {
				x: alexander.position.x,
				z: alexander.position.z
			} : null
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorBloom, {})
	] });
}
function InteractionPanel({ employee, alexander, nearCeo, onClose, onCommand }) {
	const showCeo = nearCeo || employee?.id === "alexander";
	if (!employee && !showCeo) return null;
	const ceo = employee?.id === "alexander" ? employee : alexander;
	const person = employee;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
		className: "office-panel",
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .25,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		children: [showCeo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "office-panel-block",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "office-kicker",
					children: "Executive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "CEO Alexander" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "office-status-line",
					children: ["Status ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: statusLabel(ceo?.status ?? "idle") })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "office-primary",
					onClick: onCommand,
					children: "Send Command"
				})
			]
		}), person && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "office-panel-block",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "office-panel-head",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "office-kicker",
						children: person.department
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "office-text",
						onClick: onClose,
						children: "Close"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: person.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "office-facts",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: person.role })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: person.department })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: statusLabel(person.status) })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Current task" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: person.current_task ?? "None" })] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "office-kicker",
					children: "Skills"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "office-skills",
					children: person.skills.map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: skill }, skill))
				})
			]
		})]
	});
}
function VirtualOffice() {
	const office = useVirtualOffice();
	const control = (0, import_react.useRef)({
		playing: false,
		touch: {
			steer: 0,
			throttle: 0
		},
		autopilot: null
	}).current;
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [commandOpen, setCommandOpen] = (0, import_react.useState)(false);
	const [directoryOpen, setDirectoryOpen] = (0, import_react.useState)(false);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const employees = office.state.employees;
	const selected = employees.find((employee) => employee.id === selectedId) ?? null;
	const alexander = employees.find((employee) => employee.id === "alexander") ?? null;
	(0, import_react.useEffect)(() => setMounted(true), []);
	(0, import_react.useEffect)(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const id = window.setTimeout(() => {
			control.playing = true;
			setPlaying(true);
		}, reduce ? 500 : 7600);
		return () => window.clearTimeout(id);
	}, [control]);
	function enter() {
		control.playing = true;
		setPlaying(true);
	}
	function approach(roomId) {
		const room = ROOMS.find((item) => item.id === roomId);
		if (!room) return;
		control.autopilot = visitPoint(room);
		control.playing = true;
		setPlaying(true);
		setDirectoryOpen(false);
	}
	function approachPerson(id) {
		const person = employees.find((employee) => employee.id === id);
		if (!person) return;
		control.autopilot = {
			x: person.position.x,
			z: person.position.z + 1.55
		};
		control.playing = true;
		setPlaying(true);
		setSelectedId(id);
		setDirectoryOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionConfig, {
		reducedMotion: "user",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "office-root",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "office-canvas",
					children: mounted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
						shadows: true,
						dpr: [1, 1.5],
						camera: {
							position: [
								0,
								2.4,
								12
							],
							fov: 56,
							near: .1,
							far: 80
						},
						gl: {
							antialias: true,
							powerPreference: "high-performance"
						},
						onCreated: ({ gl }) => {
							gl.toneMappingExposure = 1.85;
						},
						onPointerMissed: () => setSelectedId(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficeScene, {
							employees,
							selectedId,
							onSelect: setSelectedId,
							control
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "office-top",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "office-kicker",
						children: "AI Company OS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Virtual floor" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "office-top-actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: office.connected ? "office-live is-on" : "office-live",
							children: office.connected ? "Live" : "Linking"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							className: "office-ghost",
							children: "Command Center"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "office-feed",
					"aria-live": "polite",
					children: [office.linkError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "office-alert",
						children: office.linkError
					}), office.feed.slice(0, 3).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: eventLabel(event.type, event.data) }, event.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorMap, { employees }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorDossier, {
					employee: selected,
					alexander,
					onClose: () => setSelectedId(null),
					onCommand: () => setCommandOpen(true)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "office-stick",
					"aria-hidden": !playing,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Joystick, { onChange: (axes) => {
						control.touch = axes;
					} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Move" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "office-help",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "W forward · S back · A turn left · D turn right" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "office-ghost",
						onClick: () => setDirectoryOpen((open) => !open),
						children: "Rooms"
					})]
				}),
				directoryOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "office-directory",
					children: [employees.map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => approachPerson(employee.id),
						children: employee.name
					}, employee.id)), ROOMS.map((room) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => approach(room.id),
						children: room.name
					}, room.id))]
				}),
				commandOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "office-modal-back",
					role: "presentation",
					onClick: () => setCommandOpen(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						className: "office-modal",
						role: "dialog",
						"aria-labelledby": "command-title",
						initial: {
							opacity: 0,
							y: 12
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .25,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						onClick: (event) => event.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "office-kicker",
								children: "Founder command"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "command-title",
								children: "Instruct Alexander"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "office-note",
								children: "Same command desk as the Command Center. Plans and assignments only — nothing is deployed."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandComposer, { onSubmit: async (command) => {
								await office.sendCommand(command);
							} }),
							office.commandError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "office-alert",
								children: office.commandError
							}),
							office.commandResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "office-result",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"Project ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: office.commandResult.project }),
									" · ",
									office.commandResult.status
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: office.commandResult.strategy.objective })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "office-ghost",
								onClick: () => setCommandOpen(false),
								children: "Close"
							})
						]
					})
				}),
				!playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "office-gate",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "office-kicker",
							children: "Headquarters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "The company is already at work." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A short reveal of the floor, then the bridge is yours. Walk in. Alexander holds the CEO room — the same command desk as the Command Center." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "office-primary",
							onClick: enter,
							children: "Start"
						})
					] })
				})
			]
		})
	});
}
function FloorMap({ employees }) {
	const pose = useFounderPose();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "office-map",
		viewBox: "-22 -22 44 44",
		role: "img",
		"aria-label": "Floor map",
		children: [
			ROOMS.map((room) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: room.x - room.w / 2,
				y: room.z - room.d / 2,
				width: room.w,
				height: room.d,
				className: room.accent === "gold" ? "map-gold" : "map-blue"
			}, room.id)),
			employees.map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: employee.position.x,
				cy: employee.position.z,
				r: .55,
				className: "map-person"
			}, employee.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: pose.x,
				cy: pose.z,
				r: .7,
				className: "map-founder"
			})
		]
	});
}
function FloorDossier({ employee, alexander, onClose, onCommand }) {
	const pose = useFounderPose();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InteractionPanel, {
		employee,
		alexander,
		nearCeo: pose.nearCeo,
		onClose,
		onCommand
	});
}
function eventLabel(type, data) {
	const name = typeof data.name === "string" ? data.name : "Company";
	if (type === "employee_status_changed") return `${name} · ${String(data.status ?? "updated")}`;
	if (type === "task_assigned") return `${name} assigned`;
	if (type === "task_completed") return `${name} completed a task`;
	if (type === "meeting_started") return "Meeting started";
	if (type === "project_phase_changed") return `${String(data.name ?? "Project")} · ${String(data.phase ?? data.status ?? "")}`;
	return type;
}
function Joystick({ onChange }) {
	const pad = (0, import_react.useRef)(null);
	const pointer = (0, import_react.useRef)(null);
	function update(clientX, clientY) {
		const el = pad.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
		const dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
		const dead = (value) => Math.abs(value) < .18 ? 0 : Math.max(-1, Math.min(1, value));
		onChange({
			steer: dead(-dx),
			throttle: dead(-dy)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: pad,
		className: "office-pad",
		onPointerDown: (event) => {
			pointer.current = event.pointerId;
			event.currentTarget.setPointerCapture(event.pointerId);
			update(event.clientX, event.clientY);
		},
		onPointerMove: (event) => {
			if (pointer.current !== event.pointerId) return;
			update(event.clientX, event.clientY);
		},
		onPointerUp: (event) => {
			if (pointer.current !== event.pointerId) return;
			pointer.current = null;
			onChange({
				steer: 0,
				throttle: 0
			});
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
	});
}
//#endregion
export { VirtualOffice as t };
