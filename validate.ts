import { err, ok, warn } from "../util/terminal.js";
import { existsRoom, readManifest, readState } from "../storage/roomStore.js";
import { validateManifest } from "../rules/validator.js";

export function validateRoom(roomId: string) {
  if (!existsRoom(roomId)) {
    console.log(err(`Room not found: ${roomId}`));
    process.exitCode = 1;
    return;
  }
  const m = readManifest(roomId);
  const s = readState(roomId);
  const findings = validateManifest(m);

  console.log(ok(`Manifest OK: ${roomId}`));
  for (const f of findings) {
    const line = `${f.level.toUpperCase()} ${f.code}: ${f.message}`;
    console.log(f.level === "error" ? err(line) : warn(line));
  }

  // sanity checks
  if (s.entropy > 2) console.log(warn("Entropy is high. Room may be unstable."));
  if (m.mutation_level > 0.6) console.log(warn("Mutation level is elevated. Expect drift."));
}
