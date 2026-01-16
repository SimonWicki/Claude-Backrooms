import { ensureDir, WORKSPACE_DIR, ROOMS_DIR, GRAPH_DIR } from "../config/paths.js";
import { banner, ok } from "../util/terminal.js";

export function initWorkspace() {
  console.log(banner());
  ensureDir(WORKSPACE_DIR);
  ensureDir(ROOMS_DIR);
  ensureDir(GRAPH_DIR);
  console.log(ok(`Workspace initialized at ${WORKSPACE_DIR}`));
}
