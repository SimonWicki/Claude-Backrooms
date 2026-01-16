import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { nanoid } from "nanoid";
import ora from "ora";
import { ROOMSETSAMPLE } from "../engine/samples.js";
import { ensureDir, ROOMS_DIR } from "../config/paths.js";
import { err, ok, warn } from "../util/terminal.js";
import { existsRoom, listRooms, readManifest, readState, roomPaths, writeManifest, writeState, appendEvent } from "../storage/roomStore.js";
import { RoomManifestSchema, DerivedStateSchema } from "../schemas/room.js";

function csv(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export async function roomCreate(opts: any) {
  ensureDir(ROOMS_DIR);
  const id = opts.id as string;
  if (existsRoom(id)) {
    console.log(err(`Room already exists: ${id}`));
    process.exitCode = 1;
    return;
  }

  const manifest = RoomManifestSchema.parse({
    room_id: id,
    created_at: new Date().toISOString(),
    ruleset: opts.ruleset,
    memory_scope: opts.memory,
    allowed_outputs: csv(opts.allowed),
    forbidden: csv(opts.forbidden || ""),
    sealed: false,
    note: opts.note,
    lineage: {},
    mutation_level: 0,
  });

  const state = DerivedStateSchema.parse({
    room_id: id,
    entropy: 0,
    mutation_level: manifest.mutation_level,
    enters: 0,
    violations: 0,
    updated_at: new Date().toISOString(),
  });

  const spin = ora(`Creating room ${id}`).start();
  writeManifest(manifest);
  writeState(state);
  appendEvent(id, "enter", { op: "create", by: "operator" });
  spin.succeed(`Room created: ${id}`);
  console.log(ok(`Path: ${roomPaths(id).dir}`));
}

export async function roomList() {
  ensureDir(ROOMS_DIR);
  const rooms = listRooms();
  if (rooms.length === 0) {
    console.log(warn("No rooms found. Run `claude-backrooms init` then `room create`."));
    return;
  }
  for (const r of rooms) {
    const m = readManifest(r);
    const s = readState(r);
    const seal = m.sealed ? "SEALED" : "OPEN";
    console.log(`${r}  [${seal}]  ruleset=${m.ruleset}  entropy=${s.entropy.toFixed(2)}  mutation=${m.mutation_level.toFixed(2)}`);
  }
}

export async function roomShow(roomId: string) {
  if (!existsRoom(roomId)) {
    console.log(err(`Room not found: ${roomId}`));
    process.exitCode = 1;
    return;
  }
  const m = readManifest(roomId);
  const s = readState(roomId);
  console.log(yaml.dump(m, { lineWidth: 120 }));
  console.log(JSON.stringify(s, null, 2));
}

export async function roomSeal(roomId: string) {
  if (!existsRoom(roomId)) {
    console.log(err(`Room not found: ${roomId}`));
    process.exitCode = 1;
    return;
  }
  const m = readManifest(roomId);
  if (m.sealed) {
    console.log(warn(`Room already sealed: ${roomId}`));
    return;
  }
  m.sealed = true;
  writeManifest(m);
  appendEvent(roomId, "seal", { op: "seal", by: "operator" });
  console.log(ok(`Room sealed: ${roomId}`));
}

export async function roomFork(roomId: string, opts: any) {
  if (!existsRoom(roomId)) {
    console.log(err(`Room not found: ${roomId}`));
    process.exitCode = 1;
    return;
  }
  const parent = readManifest(roomId);
  if (parent.sealed) {
    console.log(err(`Cannot fork sealed room: ${roomId}`));
    process.exitCode = 1;
    return;
  }
  const childId = opts.new as string;
  if (existsRoom(childId)) {
    console.log(err(`Target room exists: ${childId}`));
    process.exitCode = 1;
    return;
  }

  const delta = Math.max(0, Math.min(1, parseFloat(opts.mutate ?? "0.05")));
  const childMutation = Math.max(0, Math.min(1, (parent.mutation_level ?? 0) + delta));

  const child = {
    ...parent,
    room_id: childId,
    created_at: new Date().toISOString(),
    lineage: { parent: parent.room_id, forked_at: new Date().toISOString() },
    mutation_level: childMutation,
    sealed: false,
    note: `Forked from ${parent.room_id} (+${delta.toFixed(2)} mutation)`,
  };

  writeManifest(RoomManifestSchema.parse(child));

  // inherit partial state
  const pState = readState(roomId);
  const cState = {
    ...pState,
    room_id: childId,
    entropy: pState.entropy + delta * 0.5,
    mutation_level: childMutation,
    updated_at: new Date().toISOString(),
  };
  writeState(DerivedStateSchema.parse(cState));

  appendEvent(roomId, "fork", { to: childId, delta });
  appendEvent(childId, "fork", { from: roomId, delta });
  console.log(ok(`Forked ${roomId} -> ${childId}`));
}
