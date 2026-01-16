import type { LLMAdapter } from "./types.js";
import { hashText } from "../storage/roomStore.js";

function stablePick(hash: string, options: string[]) {
  const n = parseInt(hash.slice(0, 8), 16);
  return options[n % options.length];
}

export const MockAdapter: LLMAdapter = {
  name: "mock",
  async generate({ room, input, history }) {
    const h = hashText(`${room.room_id}:${room.ruleset}:${input}:${history.length}`);
    const mode = stablePick(h, ["INDEX", "SUMMARY", "DIAGNOSTIC"]);
    const lines: string[] = [];

    if (mode === "INDEX") {
      lines.push(`INDEX:${room.room_id}`);
      lines.push(`RULESET:${room.ruleset}`);
      lines.push(`ITEMS:`);
      const words = input.split(/\s+/).filter(Boolean).slice(0, 32);
      const uniq = Array.from(new Set(words.map((w) => w.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()))).filter(Boolean);
      for (const w of uniq.slice(0, 12)) lines.push(`  - ${w}`);
      lines.push(`NOTES: derived from input tokens (mock adapter)`);
    } else if (mode === "SUMMARY") {
      lines.push(`SUMMARY:${room.room_id}`);
      lines.push(input.slice(0, 220) + (input.length > 220 ? "…" : ""));
      lines.push(`HISTORY_EVENTS:${history.length}`);
      lines.push(`MUTATION:${room.mutation_level.toFixed(2)}`);
    } else {
      lines.push(`DIAGNOSTIC:${room.room_id}`);
      lines.push(`allowed_outputs=${room.allowed_outputs.join(",")}`);
      lines.push(`forbidden=${room.forbidden.join(",") || "(none)"}`);
      lines.push(`sealed=${room.sealed}`);
      lines.push(`memory=${room.memory_scope}`);
    }

    return { output: lines.join("\n"), meta: { adapter: "mock", hash: h.slice(0, 12) } };
  },
};
