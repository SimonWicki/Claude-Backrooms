import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { nanoid } from "nanoid";
import crypto from "node:crypto";
import { ensureDir, ROOMS_DIR } from "../config/paths.js";
import { RoomManifestSchema, DerivedStateSchema, type RoomManifest, type DerivedState } from "../schemas/room.js";
import { EventSchema, type Event } from "../schemas/event.js";

export function roomDir(roomId: string) {
  return path.join(ROOMS_DIR, roomId);
}

export function roomPaths(roomId: string) {
  const dir = roomDir(roomId);
  return {
    dir,
    manifest: path.join(dir, "room.yaml"),
    events: path.join(dir, "events.ndjson"),
    state: path.join(dir, "state.json"),
  };
}

export function existsRoom(roomId: string) {
  return fs.existsSync(roomDir(roomId));
}

export function writeManifest(manifest: RoomManifest) {
  const p = roomPaths(manifest.room_id).manifest;
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, yaml.dump(manifest, { lineWidth: 120 }), "utf-8");
}

export function readManifest(roomId: string): RoomManifest {
  const p = roomPaths(roomId).manifest;
  const raw = fs.readFileSync(p, "utf-8");
  const data = yaml.load(raw);
  return RoomManifestSchema.parse(data);
}

export function writeState(state: DerivedState) {
  const p = roomPaths(state.room_id).state;
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(state, null, 2), "utf-8");
}

export function readState(roomId: string): DerivedState {
  const p = roomPaths(roomId).state;
  const raw = fs.readFileSync(p, "utf-8");
  const data = JSON.parse(raw);
  return DerivedStateSchema.parse(data);
}

export function appendEvent(roomId: string, kind: Event["kind"], payload: Record<string, any>) {
  const p = roomPaths(roomId).events;
  ensureDir(path.dirname(p));
  const ev: Event = EventSchema.parse({
    id: nanoid(),
    ts: new Date().toISOString(),
    kind,
    room_id: roomId,
    payload,
  });
  fs.appendFileSync(p, JSON.stringify(ev) + "\n", "utf-8");
  return ev;
}

export function readEvents(roomId: string, limit = 200): Event[] {
  const p = roomPaths(roomId).events;
  if (!fs.existsSync(p)) return [];
  const lines = fs.readFileSync(p, "utf-8").trim().split(/\n+/).filter(Boolean);
  const tail = lines.slice(Math.max(0, lines.length - limit));
  return tail.map((l) => EventSchema.parse(JSON.parse(l)));
}

export function hashText(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function listRooms(): string[] {
  if (!fs.existsSync(ROOMS_DIR)) return [];
  return fs.readdirSync(ROOMS_DIR).filter((d) => fs.statSync(path.join(ROOMS_DIR, d)).isDirectory());
}
