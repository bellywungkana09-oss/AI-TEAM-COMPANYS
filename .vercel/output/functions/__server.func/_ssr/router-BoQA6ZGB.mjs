import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@react-three/fiber+[...].mjs";
import { _ as createFileRoute, b as useRouter, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BoQA6ZGB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-DRjtSooX.css";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "AI Company OS" },
			{
				name: "theme-color",
				content: "#07090e"
			},
			{
				name: "description",
				content: "Walk the virtual floor of an AI company already at work."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Outfit:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-JtL-SORZ.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./dashboard-CRgMAZg6.mjs");
var Route$2 = createFileRoute("/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./virtual-office-CtIPWV1Z.mjs");
var Route$1 = createFileRoute("/virtual-office")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var ACCENT = {
	gold: "#d6b36a",
	blue: "#3ec5ff",
	orange: "#ff8a3d",
	purple: "#b07cff",
	cyan: "#3dffe8",
	green: "#3dff9a"
};
var ROOMS = [
	{
		id: "ceo",
		name: "CEO Room",
		x: 0,
		z: -16.4,
		w: 11,
		d: 8,
		doors: ["s"],
		accent: "gold"
	},
	{
		id: "technology",
		name: "Technology",
		x: -13.6,
		z: -6.4,
		w: 8.6,
		d: 7.4,
		doors: ["e"],
		accent: "blue"
	},
	{
		id: "product",
		name: "Product",
		x: 13.6,
		z: -6.4,
		w: 8.6,
		d: 7.4,
		doors: ["w"],
		accent: "blue"
	},
	{
		id: "design",
		name: "Design",
		x: -13.6,
		z: 8.6,
		w: 8.6,
		d: 7.4,
		doors: ["e"],
		accent: "gold"
	},
	{
		id: "development",
		name: "Development",
		x: 13.6,
		z: 8.6,
		w: 8.6,
		d: 7.4,
		doors: ["w"],
		accent: "blue"
	},
	{
		id: "qa",
		name: "Quality Assurance",
		x: 0,
		z: 16.4,
		w: 11,
		d: 7.2,
		doors: ["n"],
		accent: "blue"
	},
	{
		id: "meeting",
		name: "Meeting Room",
		x: 0,
		z: -2.1,
		w: 9.4,
		d: 7.2,
		doors: ["n", "s"],
		accent: "gold"
	}
];
var ROSTER = [
	{
		id: "alexander",
		name: "Alexander",
		role: "CEO AI",
		department: "Executive",
		room_id: "ceo",
		skills: ["strategy", "leadership"],
		accent: ACCENT.gold
	},
	{
		id: "marcus",
		name: "Marcus",
		role: "CTO AI",
		department: "Technology",
		room_id: "technology",
		skills: [
			"software architecture",
			"technical planning",
			"technology decision"
		],
		accent: ACCENT.blue
	},
	{
		id: "olivia",
		name: "Olivia",
		role: "Product Manager AI",
		department: "Product",
		room_id: "product",
		skills: [
			"requirement analysis",
			"user story",
			"product planning"
		],
		accent: ACCENT.orange
	},
	{
		id: "sophia",
		name: "Sophia",
		role: "UI/UX Designer AI",
		department: "Design",
		room_id: "design",
		skills: [
			"ui design",
			"ux flow",
			"design system"
		],
		accent: ACCENT.purple
	},
	{
		id: "david",
		name: "David",
		role: "Software Engineer AI",
		department: "Technology",
		room_id: "development",
		skills: [
			"frontend development",
			"backend development",
			"debugging"
		],
		accent: ACCENT.cyan
	},
	{
		id: "emma",
		name: "Emma",
		role: "Quality Assurance AI",
		department: "Quality Assurance",
		room_id: "qa",
		skills: [
			"testing",
			"bug analysis",
			"quality review"
		],
		accent: ACCENT.green
	}
];
var FOUNDER_SPAWN = {
	x: 0,
	z: 6.6,
	yaw: 0
};
var roomById = Object.fromEntries(ROOMS.map((room) => [room.id, room]));
function roomOf(id) {
	return roomById[ROSTER.find((person) => person.id === id)?.room_id ?? "meeting"] ?? ROOMS[0];
}
function shift(room, alongDoor) {
	const door = room.doors[0] ?? "s";
	if (door === "s") return {
		x: room.x,
		z: room.z - room.d / 2 + alongDoor
	};
	if (door === "n") return {
		x: room.x,
		z: room.z + room.d / 2 - alongDoor
	};
	if (door === "e") return {
		x: room.x - room.w / 2 + alongDoor,
		z: room.z
	};
	return {
		x: room.x + room.w / 2 - alongDoor,
		z: room.z
	};
}
function deskPoint(room) {
	return shift(room, 1.45);
}
function chairPoint(room) {
	return shift(room, 2.35);
}
function greetPoint(room) {
	return shift(room, room.d / 2 - 1.25);
}
function meetingSeat(index) {
	const room = roomById.meeting;
	const angle = -Math.PI / 2 + index / ROSTER.length * Math.PI * 2;
	return {
		x: room.x + Math.cos(angle) * 2.2,
		z: room.z + Math.sin(angle) * 1.5
	};
}
/** yaw 0 faces world −Z. */
function yawToward(from, to) {
	return Math.atan2(-(to.x - from.x), -(to.z - from.z));
}
function workYaw(room) {
	const door = room.doors[0] ?? "s";
	if (door === "s") return 0;
	if (door === "n") return Math.PI;
	if (door === "e") return Math.PI / 2;
	return -Math.PI / 2;
}
function poseFor(id, status) {
	const index = Math.max(0, ROSTER.findIndex((person) => person.id === id));
	const room = roomOf(id);
	if (status === "meeting") {
		const seat = meetingSeat(index);
		const center = roomById.meeting;
		return {
			position: {
				x: seat.x,
				y: 0,
				z: seat.z
			},
			facing: yawToward(seat, center)
		};
	}
	if (status === "idle" || status === "completed") {
		const spot = greetPoint(room);
		const door = approachPoint(room);
		return {
			position: {
				x: spot.x,
				y: 0,
				z: spot.z
			},
			facing: yawToward(spot, door)
		};
	}
	const chair = chairPoint(room);
	return {
		position: {
			x: chair.x,
			y: 0,
			z: chair.z
		},
		facing: workYaw(room)
	};
}
function approachPoint(room) {
	const door = room.doors[0] ?? "s";
	const gap = 1.7;
	if (door === "s") return {
		x: room.x,
		z: room.z + room.d / 2 + gap
	};
	if (door === "n") return {
		x: room.x,
		z: room.z - room.d / 2 - gap
	};
	if (door === "e") return {
		x: room.x + room.w / 2 + gap,
		z: room.z
	};
	return {
		x: room.x - room.w / 2 - gap,
		z: room.z
	};
}
function visitPoint(room) {
	if (room.id === "meeting") return {
		x: room.x,
		z: room.z + room.d / 2 - 1.2
	};
	const greet = greetPoint(room);
	const door = approachPoint(room);
	const dx = door.x - greet.x;
	const dz = door.z - greet.z;
	const len = Math.hypot(dx, dz) || 1;
	return {
		x: greet.x + dx / len * 1.45,
		z: greet.z + dz / len * 1.45
	};
}
/** Status chooses the pose. Movement is a separate flag — assigned is not walking. */
function animationFor(name, status, moving) {
	if (moving) return "walk";
	if (status === "idle" && name === "Alexander") return "thinking";
	if (status === "idle" || status === "assigned") return "idle";
	if (status === "working") return "working";
	if (status === "meeting") return "meeting";
	if (status === "review") return "review";
	if (status === "completed") return "completed";
	return "alert";
}
function wall(x0, x1, z0, z1) {
	return {
		minX: Math.min(x0, x1),
		maxX: Math.max(x0, x1),
		minZ: Math.min(z0, z1),
		maxZ: Math.max(z0, z1)
	};
}
function sideWalls(room, side, x0, x1, z0, z1, t) {
	const open = room.doors.includes(side);
	const gap = 1.85;
	if (side === "s" || side === "n") {
		const z = side === "s" ? z1 : z0;
		if (!open) return [wall(x0, x1, z - t, z + t)];
		return [wall(x0, room.x - gap / 2, z - t, z + t), wall(room.x + gap / 2, x1, z - t, z + t)];
	}
	const x = side === "e" ? x1 : x0;
	if (!open) return [wall(x - t, x + t, z0, z1)];
	return [wall(x - t, x + t, z0, room.z - gap / 2), wall(x - t, x + t, room.z + gap / 2, z1)];
}
function wallsFor(room) {
	const t = .14;
	const x0 = room.x - room.w / 2;
	const x1 = room.x + room.w / 2;
	const z0 = room.z - room.d / 2;
	const z1 = room.z + room.d / 2;
	const boxes = [];
	for (const side of [
		"n",
		"s",
		"e",
		"w"
	]) boxes.push(...sideWalls(room, side, x0, x1, z0, z1, t));
	return boxes;
}
function officeWalls() {
	const boxes = ROOMS.flatMap((room) => wallsFor(room));
	const bound = 22;
	boxes.push(wall(-22, bound, -22, -21.6));
	boxes.push(wall(-22, bound, 21.6, bound));
	boxes.push(wall(-22, -21.6, -22, bound));
	boxes.push(wall(21.6, bound, -22, bound));
	return boxes;
}
function resolveWalls(x, z, radius, boxes) {
	let px = x;
	let pz = z;
	for (let pass = 0; pass < 3; pass += 1) for (const box of boxes) {
		const minX = box.minX - radius;
		const maxX = box.maxX + radius;
		const minZ = box.minZ - radius;
		const maxZ = box.maxZ + radius;
		if (px <= minX || px >= maxX || pz <= minZ || pz >= maxZ) continue;
		const left = px - minX;
		const right = maxX - px;
		const down = pz - minZ;
		const up = maxZ - pz;
		const min = Math.min(left, right, down, up);
		if (min === left) px = minX;
		else if (min === right) px = maxX;
		else if (min === down) pz = minZ;
		else pz = maxZ;
	}
	return {
		x: px,
		z: pz
	};
}
var PHASE_MS = 12e3;
var FOUNDER_ID = "00000000-0000-4000-8000-000000000001";
var SCRIPTS = {
	alexander: [
		{
			status: "idle",
			task: "Available for founder direction"
		},
		{
			status: "meeting",
			task: "Hosting the floor sync"
		},
		{
			status: "working",
			task: "Drafting company priorities"
		},
		{
			status: "review",
			task: "Reading the morning brief"
		}
	],
	marcus: [
		{
			status: "working",
			task: "Reviewing service boundaries"
		},
		{
			status: "meeting",
			task: "Architecture sync"
		},
		{
			status: "review",
			task: "Reading the technical plan"
		},
		{
			status: "working",
			task: "Updating the system map"
		}
	],
	olivia: [
		{
			status: "working",
			task: "Writing product requirements"
		},
		{
			status: "meeting",
			task: "Scoping the next slice"
		},
		{
			status: "working",
			task: "Ordering the user stories"
		},
		{
			status: "review",
			task: "Checking the requirement draft"
		}
	],
	sophia: [
		{
			status: "working",
			task: "Composing the design system"
		},
		{
			status: "meeting",
			task: "Design critique"
		},
		{
			status: "working",
			task: "Refining the interface frames"
		},
		{
			status: "idle",
			task: "Waiting on the next brief"
		}
	],
	david: [
		{
			status: "working",
			task: "Implementing the delivery surface"
		},
		{
			status: "meeting",
			task: "Implementation sync"
		},
		{
			status: "working",
			task: "Wiring the company monitors"
		},
		{
			status: "assigned",
			task: "Picking up the next engineering task"
		}
	],
	emma: [
		{
			status: "review",
			task: "Reviewing quality gates"
		},
		{
			status: "meeting",
			task: "QA sync"
		},
		{
			status: "failed",
			task: "Regression on the delivery gate"
		},
		{
			status: "working",
			task: "Re-running the quality checklist"
		}
	]
};
var PROJECT_PHASE = [
	"development",
	"testing",
	"development",
	"planning"
];
function uid(prefix) {
	return `${prefix}-${crypto.randomUUID()}`;
}
function stamp(now) {
	return new Date(now).toISOString();
}
function pushEvent(world, now, type, data) {
	world.seq += 1;
	const event = {
		id: uid("evt"),
		seq: world.seq,
		epoch: world.epoch,
		type,
		occurred_at: stamp(now),
		data
	};
	world.events.push(event);
	if (world.events.length > 80) world.events.splice(0, world.events.length - 80);
	return event;
}
function log(world, now, event, description) {
	world.activity.unshift({
		id: uid("act"),
		event,
		description,
		timestamp: stamp(now)
	});
	if (world.activity.length > 40) world.activity.pop();
}
function createWorld(now) {
	const world = {
		epoch: now,
		seq: 0,
		applied: {},
		overrides: {},
		meetingKey: "",
		projects: [{
			id: "proj-command-surface",
			name: "Founder Command Surface",
			status: "development",
			progress: 46,
			created_at: stamp(now)
		}],
		tasks: [],
		activity: [],
		events: [],
		phase: 0,
		phaseHeld: false
	};
	for (const person of ROSTER) {
		const beat = beatFor(world, person.id, now);
		world.applied[person.id] = beat.status;
		world.tasks.push({
			id: `task-${person.id}`,
			title: beat.task,
			status: taskStatusFor(beat.status),
			priority: person.id === "alexander" ? "high" : "medium",
			progress: person.id === "emma" ? 62 : 40,
			assigned_employee: person.name,
			project_id: world.projects[0].id
		});
	}
	log(world, now, "company_online", "Company floor is live. Alexander is in the CEO room.");
	return world;
}
function phaseIndex(world, now) {
	const elapsed = Math.max(0, now - world.epoch);
	return Math.floor(elapsed / PHASE_MS) % SCRIPTS.alexander.length;
}
/** Active founder override, or null once the chain has expired. */
function activeOverride(world, id, now) {
	const override = world.overrides[id];
	if (!override) return null;
	if (now < override.until) return {
		status: override.status,
		task: override.task
	};
	if (override.then && now < override.then.until) return {
		status: override.then.status,
		task: override.then.task
	};
	return null;
}
/** Drop overrides whose entire lifecycle has elapsed. Returns removed ids. */
function cleanupOverrides(world, now) {
	const removed = [];
	for (const id of Object.keys(world.overrides)) {
		if (activeOverride(world, id, now)) continue;
		delete world.overrides[id];
		removed.push(id);
	}
	return removed;
}
function beatFor(world, id, now) {
	return activeOverride(world, id, now) ?? SCRIPTS[id][phaseIndex(world, now)];
}
function taskStatusFor(status) {
	if (status === "review") return "review";
	if (status === "failed") return "blocked";
	if (status === "completed") return "done";
	if (status === "assigned") return "assigned";
	if (status === "idle") return "todo";
	return "in_progress";
}
function currentTask(world, name) {
	const projectId = world.projects[0]?.id;
	return world.tasks.find((item) => item.assigned_employee === name && item.project_id === projectId) ?? world.tasks.find((item) => item.assigned_employee === name);
}
function syncAssignment(world, person, beat, statusChanged) {
	const task = currentTask(world, person.name);
	if (!task) return;
	task.title = beat.task;
	task.assigned_employee = person.name;
	task.status = taskStatusFor(beat.status);
	if (!statusChanged) return;
	if (beat.status === "completed") task.progress = 100;
	else if (beat.status !== "failed") task.progress = Math.min(95, task.progress + 4);
}
function snapshotEmployees(world, now) {
	return ROSTER.map((person) => {
		const beat = beatFor(world, person.id, now);
		return {
			id: person.id,
			name: person.name,
			role: person.role,
			department: person.department,
			status: beat.status,
			current_task: beat.task,
			skills: person.skills
		};
	});
}
function officeState(world, now) {
	const employees = snapshotEmployees(world, now).map((employee) => {
		const pose = poseFor(employee.id, employee.status);
		return {
			...employee,
			room_id: ROSTER.find((person) => person.id === employee.id)?.room_id ?? "meeting",
			position: pose.position,
			facing: pose.facing,
			animation: animationFor(employee.name, employee.status, false)
		};
	});
	return {
		epoch: world.epoch,
		seq: world.seq,
		office: { rooms: ROOMS },
		employees
	};
}
function companyStatus(world, now) {
	const employees = snapshotEmployees(world, now);
	const activeTasks = employees.filter((employee) => [
		"assigned",
		"working",
		"review",
		"meeting"
	].includes(employee.status)).length;
	return {
		employees_total: employees.length,
		projects_total: world.projects.length,
		active_projects: world.projects.filter((project) => project.status !== "completed").length,
		active_tasks: activeTasks,
		activities_today: world.activity.length,
		system_status: "online"
	};
}
function tickWorld(world, now) {
	const before = world.events.length;
	const removed = cleanupOverrides(world, now);
	const phase = phaseIndex(world, now);
	const phaseChanged = phase !== world.phase;
	world.phase = phase;
	const alexanderHeld = activeOverride(world, "alexander", now) != null;
	const released = world.phaseHeld || removed.includes("alexander");
	if (alexanderHeld) world.phaseHeld = true;
	else {
		world.phaseHeld = false;
		const project = world.projects[0];
		if (project && (phaseChanged || released)) {
			const next = PROJECT_PHASE[phase] ?? "development";
			if (project.status !== next) {
				project.status = next;
				project.progress = Math.min(96, project.progress + 8);
				pushEvent(world, now, "project_phase_changed", {
					project_id: project.id,
					name: project.name,
					phase: next,
					status: next
				});
				log(world, now, "project_phase_changed", `${project.name} moved to ${next}.`);
			}
		}
	}
	const meetingIds = [];
	for (const person of ROSTER) {
		const beat = beatFor(world, person.id, now);
		const statusChanged = world.applied[person.id] !== beat.status;
		syncAssignment(world, person, beat, statusChanged);
		if (!statusChanged) {
			if (beat.status === "meeting") meetingIds.push(person.id);
			continue;
		}
		world.applied[person.id] = beat.status;
		pushEvent(world, now, "employee_status_changed", {
			employee_id: person.id,
			name: person.name,
			status: beat.status,
			current_task: beat.task
		});
		log(world, now, "employee_status_changed", `${person.name} is now ${beat.status}.`);
		if (beat.status === "assigned") {
			pushEvent(world, now, "task_assigned", {
				employee_id: person.id,
				name: person.name,
				task: beat.task
			});
			log(world, now, "task_assigned", `${person.name} assigned: ${beat.task}.`);
		}
		if (beat.status === "completed") {
			pushEvent(world, now, "task_completed", {
				employee_id: person.id,
				name: person.name,
				task: beat.task
			});
			log(world, now, "task_completed", `${person.name} completed ${beat.task}.`);
		}
		if (beat.status === "meeting") meetingIds.push(person.id);
	}
	const meetingKey = meetingIds.slice().sort().join(",");
	if (meetingIds.length >= 2 && meetingKey !== world.meetingKey) {
		world.meetingKey = meetingKey;
		pushEvent(world, now, "meeting_started", {
			employee_ids: meetingIds,
			topic: "Floor sync",
			room_id: "meeting"
		});
		log(world, now, "meeting_started", "A floor sync started in the meeting room.");
	}
	if (meetingIds.length < 2) world.meetingKey = "";
	return world.events.slice(before);
}
var ASSIGNMENTS = [
	{
		owner: "alexander",
		title: "Company Strategy"
	},
	{
		owner: "marcus",
		title: "Technical Architecture"
	},
	{
		owner: "olivia",
		title: "Product Requirements"
	},
	{
		owner: "sophia",
		title: "Design Planning"
	},
	{
		owner: "david",
		title: "Development Planning"
	},
	{
		owner: "emma",
		title: "Testing Planning"
	}
];
function commandWorld(world, command, now) {
	const titled = (command.trim().replace(/^buat\s+/i, "").trim() || "New Initiative").replace(/\s+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
	const project = {
		id: uid("proj"),
		name: titled,
		status: "planning",
		progress: 8,
		created_at: stamp(now)
	};
	world.projects.unshift(project);
	world.phaseHeld = true;
	const tasks = ASSIGNMENTS.map((plan) => {
		const person = ROSTER.find((entry) => entry.id === plan.owner);
		const title = `${plan.title}: ${titled}`;
		world.tasks.unshift({
			id: uid("task"),
			title,
			status: plan.owner === "alexander" ? "in_progress" : "assigned",
			priority: "high",
			progress: plan.owner === "alexander" ? 8 : 0,
			assigned_employee: person.name,
			project_id: project.id
		});
		if (plan.owner === "alexander") world.overrides[person.id] = {
			status: "working",
			task: title,
			until: now + 36e3
		};
		else world.overrides[person.id] = {
			status: "assigned",
			task: title,
			until: now + 7e3,
			then: {
				status: "working",
				task: title,
				until: now + 36e3
			}
		};
		return {
			title,
			description: "Initial planning task",
			priority: "high",
			assigned_employee: person.name
		};
	});
	tickWorld(world, now);
	pushEvent(world, now, "project_phase_changed", {
		project_id: project.id,
		name: project.name,
		phase: "planning",
		status: "planning"
	});
	log(world, now, "ceo_created_project", `Alexander created project ${titled}.`);
	return {
		project: titled,
		strategy: {
			project_name: titled,
			objective: command.trim() || titled,
			target_user: "Founder-defined target users",
			features: [
				"Core workflow",
				"Conversion flow",
				"Contact/support"
			],
			departments_required: [
				"Product",
				"Design",
				"Technology",
				"Quality Assurance"
			],
			priority: "high",
			risk: "Requirements require Founder validation.",
			timeline: "4 weeks"
		},
		tasks,
		status: "planning"
	};
}
function eventsSince(world, since) {
	return world.events.filter((event) => event.seq > since);
}
var globalRef = globalThis;
function bindTick(current) {
	current.tick = (now) => tickWorld(current.world, now);
}
function store() {
	if (!globalRef.__companyStore) {
		const created = {
			world: createWorld(Date.now()),
			listeners: /* @__PURE__ */ new Set(),
			ticking: false,
			tick: () => []
		};
		bindTick(created);
		globalRef.__companyStore = created;
	}
	return globalRef.__companyStore;
}
function emit(events) {
	if (events.length === 0) return;
	for (const listener of store().listeners) try {
		listener(events);
	} catch (error) {
		console.error("[company] event listener failed", error);
	}
}
function advance(now = Date.now()) {
	const current = store();
	if (current.ticking) return [];
	current.ticking = true;
	try {
		return current.tick(now);
	} finally {
		current.ticking = false;
	}
}
function ensureCompanyClock() {
	const current = store();
	bindTick(current);
	if (current.timer) return;
	const handle = setInterval(() => {
		try {
			emit(advance(Date.now()));
		} catch (error) {
			console.error("[company] clock tick failed", error);
		}
	}, 1e3);
	if (typeof handle === "object" && handle && "unref" in handle) handle.unref();
	current.timer = handle;
}
function readEmployees() {
	ensureCompanyClock();
	const now = Date.now();
	advance(now);
	return snapshotEmployees(store().world, now);
}
function readStatus() {
	ensureCompanyClock();
	const now = Date.now();
	advance(now);
	return companyStatus(store().world, now);
}
function readProjects() {
	ensureCompanyClock();
	advance();
	return store().world.projects;
}
function readTasks() {
	ensureCompanyClock();
	advance();
	return store().world.tasks;
}
function readActivity() {
	ensureCompanyClock();
	advance();
	return store().world.activity;
}
function readOfficeState() {
	ensureCompanyClock();
	const now = Date.now();
	advance(now);
	return officeState(store().world, now);
}
function readEvents(since) {
	ensureCompanyClock();
	emit(advance(Date.now()));
	return eventsSince(store().world, since);
}
function submitCommand(command, founderId) {
	if (!founderId) return {
		status: 401,
		body: { error: {
			code: "unauthorized",
			message: "X-Founder-ID required"
		} }
	};
	ensureCompanyClock();
	const now = Date.now();
	const result = commandWorld(store().world, command, now);
	emit(eventsSince(store().world, Math.max(0, store().world.seq - 24)));
	return {
		status: 201,
		body: result,
		founderId: founderId || "00000000-0000-4000-8000-000000000001"
	};
}
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "no-store"
		}
	});
}
async function handleCompanyApi(request) {
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
			let body = {};
			try {
				body = await request.json();
			} catch {
				return json({ error: {
					code: "invalid_json",
					message: "Invalid JSON"
				} }, 400);
			}
			const founder = request.headers.get("x-founder-id");
			const result = submitCommand(String(body.command ?? ""), founder);
			return json(result.body, result.status);
		}
		return json({ error: {
			code: "not_found",
			message: "Unknown company route"
		} }, 404);
	} catch (error) {
		console.error("[company] api failed", error);
		return json({ error: {
			code: "internal_server_error",
			message: "An unexpected error occurred."
		} }, 500);
	}
}
var handle = ({ request }) => handleCompanyApi(request);
var Route = createFileRoute("/api/v1/$")({ server: { handlers: {
	GET: handle,
	POST: handle
} } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	DashboardRoute: Route$2.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$4
	}),
	VirtualOfficeRoute: Route$1.update({
		id: "/virtual-office",
		path: "/virtual-office",
		getParentRoute: () => Route$4
	}),
	ApiV1SplatRoute: Route.update({
		id: "/api/v1/$",
		path: "/api/v1/$",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { ROOMS as a, approachPoint as c, poseFor as d, resolveWalls as f, workYaw as h, FOUNDER_SPAWN as i, deskPoint as l, wallsFor as m, FOUNDER_ID as n, ROSTER as o, visitPoint as p, ACCENT as r, animationFor as s, router_exports as t, officeWalls as u };
