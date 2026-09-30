import {
  FOUNDER_ID,
  commandWorld,
  companyStatus,
  createWorld,
  eventsSince,
  officeState,
  snapshotEmployees,
  tickWorld,
  type World,
} from "./world.ts";
import type { CompanyEvent } from "@/types/company";

type Listener = (events: CompanyEvent[]) => void;

type Store = {
  world: World;
  listeners: Set<Listener>;
  timer?: ReturnType<typeof setInterval>;
  /** Re-entry guard so a listener cannot start a second tick on the same world. */
  ticking: boolean;
  /** Refreshed on each init so a hot reload rebinds the interval without duplicating it. */
  tick: (now: number) => CompanyEvent[];
};

const globalRef = globalThis as typeof globalThis & { __companyStore?: Store };

function bindTick(current: Store) {
  current.tick = (now: number) => tickWorld(current.world, now);
}

function store(): Store {
  if (!globalRef.__companyStore) {
    const created: Store = {
      world: createWorld(Date.now()),
      listeners: new Set(),
      ticking: false,
      tick: () => [],
    };
    bindTick(created);
    globalRef.__companyStore = created;
  }
  return globalRef.__companyStore;
}

function emit(events: CompanyEvent[]) {
  if (events.length === 0) return;
  for (const listener of store().listeners) {
    try {
      listener(events);
    } catch (error) {
      console.error("[company] event listener failed", error);
    }
  }
}

function advance(now = Date.now()): CompanyEvent[] {
  const current = store();
  if (current.ticking) return [];
  current.ticking = true;
  try {
    return current.tick(now);
  } finally {
    current.ticking = false;
  }
}

export function stopCompanyClock(): void {
  const current = globalRef.__companyStore;
  if (!current?.timer) return;
  clearInterval(current.timer);
  current.timer = undefined;
}

export function ensureCompanyClock(): void {
  const current = store();
  bindTick(current);
  if (current.timer) return;
  const handle = setInterval(() => {
    try {
      emit(advance(Date.now()));
    } catch (error) {
      console.error("[company] clock tick failed", error);
    }
  }, 1000);
  if (typeof handle === "object" && handle && "unref" in handle) {
    handle.unref();
  }
  current.timer = handle;
}

export function readEmployees() {
  ensureCompanyClock();
  const now = Date.now();
  advance(now);
  return snapshotEmployees(store().world, now);
}

export function readStatus() {
  ensureCompanyClock();
  const now = Date.now();
  advance(now);
  return companyStatus(store().world, now);
}

export function readProjects() {
  ensureCompanyClock();
  advance();
  return store().world.projects;
}

export function readTasks() {
  ensureCompanyClock();
  advance();
  return store().world.tasks;
}

export function readActivity() {
  ensureCompanyClock();
  advance();
  return store().world.activity;
}

export function readOfficeState() {
  ensureCompanyClock();
  const now = Date.now();
  advance(now);
  return officeState(store().world, now);
}

export function readEvents(since: number) {
  ensureCompanyClock();
  const now = Date.now();
  emit(advance(now));
  return eventsSince(store().world, since);
}

export function submitCommand(command: string, founderId: string | null) {
  if (!founderId) {
    return { status: 401, body: { error: { code: "unauthorized", message: "X-Founder-ID required" } } };
  }
  ensureCompanyClock();
  const now = Date.now();
  const result = commandWorld(store().world, command, now);
  emit(eventsSince(store().world, Math.max(0, store().world.seq - 24)));
  return { status: 201, body: result, founderId: founderId || FOUNDER_ID };
}

export function subscribeCompanyEvents(listener: Listener): () => void {
  ensureCompanyClock();
  const current = store();
  current.listeners.add(listener);
  return () => current.listeners.delete(listener);
}

export function helloEvent(): CompanyEvent {
  return {
    id: "hello",
    seq: 0,
    type: "company_status_changed",
    occurred_at: new Date().toISOString(),
    data: { connection: "established" },
  };
}

export function __resetCompanyWorldForTests(now = Date.now()): World {
  stopCompanyClock();
  const fresh = createWorld(now);
  const created: Store = { world: fresh, listeners: new Set(), ticking: false, tick: () => [] };
  bindTick(created);
  globalRef.__companyStore = created;
  return fresh;
}
