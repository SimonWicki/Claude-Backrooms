import path from "node:path";
import fs from "node:fs";

export const WORKSPACE_DIR = path.resolve(process.cwd(), "data");
export const ROOMS_DIR = path.join(WORKSPACE_DIR, "rooms");
export const GRAPH_DIR = path.join(WORKSPACE_DIR, "graph");

export function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
