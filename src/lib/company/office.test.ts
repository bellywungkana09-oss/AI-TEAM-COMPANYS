import assert from "node:assert/strict";
import { test } from "node:test";
import { animationFor, poseFor, ROOMS, ROSTER } from "./layout.ts";
import { createEventGate, reduceEmployees, shouldAcceptSnapshot, validateCompanyEvent } from "./sync.ts";
import { stepWalker } from "./walker.ts";
import { commandWorld, createWorld, officeState, tickWorld } from "./world.ts";
import { __resetCompanyWorldForTests, ensureCompanyClock, stopCompanyClock } from "./world.server.ts";

test("virtual office state includes rooms and employee positions", () => {
  const world = createWorld(1_700_000_000_000);
  const state = officeState(world, world.epoch);
  assert.equal(state.epoch, world.epoch);
  assert.equal(typeof state.seq, "number");
  assert.ok(state.office.rooms.length >= 7);
  assert.equal(state.employees.length, 6);
  const alexander = state.employees.find((employee) => employee.name === "Alexander");
  const emma = state.employees.find((employee) => employee.name === "Emma");
  assert.ok(alexander);
  assert.equal(alexander.status, "idle");
  assert.equal(alexander.animation, "thinking");
  assert.ok(alexander.position.z < -10);
  assert.equal(emma?.status, "review");
  assert.equal(emma?.animation, "review");
  assert.ok((emma?.position.z ?? 0) > 10);
  assert.ok(ROOMS.some((room) => room.id === "meeting"));
});

test("status changes retarget avatars and emit company events", () => {
  const world = createWorld(0);
  const emitted = tickWorld(world, 12_000);
  const state = officeState(world, 12_000);
  const meeting = state.employees.filter((employee) => employee.status === "meeting");
  assert.ok(meeting.length >= 2);
  for (const employee of meeting) {
    assert.equal(employee.animation, "meeting");
    assert.ok(Math.abs(employee.position.z + 2.1) < 3);
  }
  assert.ok(emitted.some((event) => event.type === "employee_status_changed"));
  assert.ok(emitted.some((event) => event.type === "meeting_started"));
});

test("founder command assigns work without inventing employees", () => {
  const world = createWorld(0);
  const result = commandWorld(world, "Buat website coffee shop", 5_000);
  assert.equal(result.project, "Website Coffee Shop");
  assert.equal(result.status, "planning");
  const state = officeState(world, 5_000);
  assert.equal(state.employees.length, 6);
  const alexander = state.employees.find((employee) => employee.id === "alexander");
  assert.equal(alexander?.status, "working");
  assert.match(alexander?.current_task ?? "", /coffee shop/i);
  const david = state.employees.find((employee) => employee.id === "david");
  assert.equal(david?.status, "assigned");
  assert.equal(david?.animation, "idle");
  assert.equal(animationFor("David", "assigned", false), "idle");
  assert.equal(animationFor("David", "assigned", true), "walk");
  const task = world.tasks.find((item) => item.project_id === world.projects[0]?.id && item.assigned_employee === "David");
  assert.equal(david?.current_task, task?.title);
});

test("A turns left and D turns right while moving forward", () => {
  let left = { x: 0, z: 6.6, yaw: 0, speed: 0 };
  const keysA = new Set(["KeyW", "KeyA"]);
  for (let i = 0; i < 40; i += 1) left = stepWalker(left, keysA, { steer: 0, throttle: 0 }, null, 0.016);
  assert.ok(left.speed > 0.1, `expected speed, got ${left.speed}`);
  assert.ok(left.yaw > 0.05, `A should increase yaw, got ${left.yaw}`);

  let right = { x: 0, z: 6.6, yaw: 0, speed: 0 };
  const keysD = new Set(["KeyW", "KeyD"]);
  for (let i = 0; i < 40; i += 1) right = stepWalker(right, keysD, { steer: 0, throttle: 0 }, null, 0.016);
  assert.ok(right.yaw < -0.05, `D should decrease yaw, got ${right.yaw}`);
});

test("desk pose differs from the meeting pose", () => {
  const desk = poseFor("david", "working");
  const meet = poseFor("david", "meeting");
  assert.ok(Math.hypot(desk.position.x - meet.position.x, desk.position.z - meet.position.z) > 4);
});

test("animation mapping keeps status separate from movement", () => {
  assert.equal(animationFor("David", "idle", false), "idle");
  assert.equal(animationFor("Alexander", "idle", false), "thinking");
  assert.equal(animationFor("David", "assigned", false), "idle");
  assert.equal(animationFor("David", "assigned", true), "walk");
  assert.equal(animationFor("Marcus", "working", false), "working");
  assert.equal(animationFor("Olivia", "meeting", false), "meeting");
  assert.equal(animationFor("Emma", "review", false), "review");
  assert.equal(animationFor("Sophia", "completed", false), "completed");
  assert.equal(animationFor("Emma", "failed", false), "alert");
  assert.equal(animationFor("Emma", "failed", true), "walk");
});

test("founder command assigns every task to a roster employee", () => {
  const world = createWorld(0);
  const result = commandWorld(world, "Build API", 5_000);
  const project = world.projects[0]!;
  const fresh = world.tasks.filter((task) => task.project_id === project.id);
  assert.equal(fresh.length, 6);
  assert.equal(result.tasks.length, 6);
  const names = new Set(ROSTER.map((person) => person.name));
  for (const task of fresh) {
    assert.ok(task.assigned_employee);
    assert.ok(names.has(task.assigned_employee!));
    assert.equal(task.assigned_employee, result.tasks.find((item) => item.title === task.title)?.assigned_employee);
  }
  const state = officeState(world, 5_000);
  assert.equal(state.employees.length, 6);
  for (const employee of state.employees) {
    assert.ok(names.has(employee.name));
    const task = fresh.find((item) => item.assigned_employee === employee.name);
    assert.ok(task, employee.name);
    assert.equal(employee.current_task, task!.title);
    assert.ok(employee.status === "working" || employee.status === "assigned");
  }
});

test("command override expires and the company phase continues", () => {
  const world = createWorld(0);
  commandWorld(world, "Build API", 1_000);
  assert.equal(world.projects[0]!.status, "planning");
  tickWorld(world, 20_000);
  assert.equal(world.projects[0]!.status, "planning");
  assert.ok(world.overrides.alexander);
  tickWorld(world, 40_000);
  assert.equal(world.overrides.alexander, undefined);
  assert.equal(world.overrides.david, undefined);
  const events = tickWorld(world, 48_000);
  assert.equal(world.projects[0]!.status, "development");
  assert.ok(events.some((event) => event.type === "project_phase_changed"));
  const state = officeState(world, 48_000);
  for (const employee of state.employees) {
    const task = world.tasks.find((item) => item.assigned_employee === employee.name && item.project_id === world.projects[0]!.id);
    assert.equal(employee.current_task, task?.title);
  }
});

test("stale snapshots are rejected and a new epoch resets", () => {
  const cursor = { epoch: 5, seq: 10 };
  assert.equal(shouldAcceptSnapshot(cursor, { epoch: 5, seq: 9 }, 2, 2), "reject-stale");
  assert.equal(shouldAcceptSnapshot(cursor, { epoch: 5, seq: 12 }, 1, 2), "reject-superseded");
  assert.equal(shouldAcceptSnapshot(cursor, { epoch: 4, seq: 99 }, 3, 3), "reject-stale");
  assert.equal(shouldAcceptSnapshot({ epoch: 0, seq: 0 }, { epoch: 5, seq: 1 }, 1, 1), "accept");
  assert.equal(shouldAcceptSnapshot(cursor, { epoch: 5, seq: 12 }, 4, 4), "accept");
  assert.equal(shouldAcceptSnapshot(cursor, { epoch: 9, seq: 1 }, 5, 5), "reset");
  assert.equal(shouldAcceptSnapshot(cursor, { epoch: Number.NaN, seq: 1 }, 6, 6), "reject-stale");
});

test("duplicate and invalid events never change employees", () => {
  const gate = createEventGate();
  gate.noteEpoch(10);
  const event = {
    id: "1",
    seq: 3,
    epoch: 10,
    type: "employee_status_changed",
    occurred_at: "",
    data: { employee_id: "david", status: "working", current_task: "Build API" },
  };
  assert.equal(gate.consider(event), "apply");
  assert.equal(gate.consider(event), "duplicate");
  assert.equal(gate.consider({ ...event, seq: 4, data: { employee_id: "nobody", status: "working" } }), "invalid");
  assert.equal(gate.consider({ ...event, seq: 5, data: { employee_id: "david", status: "flying" } }), "invalid");
  assert.equal(validateCompanyEvent({ type: "nope", seq: 1, data: {} }), null);
  assert.equal(gate.consider({ ...event, seq: 1, epoch: 9 }), "stale-epoch");
  gate.noteEpoch(11);
  assert.equal(gate.consider({ ...event, seq: 3, epoch: 11 }), "apply");

  const world = createWorld(11);
  const before = officeState(world, 11).employees;
  const invalid = { id: "x", seq: 1, epoch: 11, type: "employee_status_changed", occurred_at: "", data: { employee_id: "ghost", status: "working" } };
  const after = reduceEmployees(before, invalid);
  assert.equal(after, before);
  const changed = reduceEmployees(before, { ...event, epoch: 11, data: { ...event.data, status: "review", current_task: "Build API" } });
  const david = changed.find((employee) => employee.id === "david");
  assert.equal(david?.status, "review");
  assert.equal(david?.current_task, "Build API");
  assert.equal(david?.animation, "review");
});

test("company clock does not start a second interval", () => {
  __resetCompanyWorldForTests(1_700_000_000_000);
  ensureCompanyClock();
  ensureCompanyClock();
  const current = (globalThis as typeof globalThis & { __companyStore?: { timer?: unknown } }).__companyStore;
  assert.ok(current?.timer);
  const first = current?.timer;
  ensureCompanyClock();
  assert.equal(current?.timer, first);
  stopCompanyClock();
  assert.equal(current?.timer, undefined);
});
