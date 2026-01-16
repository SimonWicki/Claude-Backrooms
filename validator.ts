import { RULESETS } from "./rulesets.js";
import type { RoomManifest } from "../schemas/room.js";

export type ValidationFinding = { level: "error" | "warn"; code: string; message: string };

export function validateManifest(m: RoomManifest): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (!RULESETS[m.ruleset]) {
    findings.push({ level: "warn", code: "RULESET_UNKNOWN", message: `Ruleset '${m.ruleset}' not found in built-in catalog.` });
  }
  if (m.allowed_outputs.length === 0) {
    findings.push({ level: "error", code: "ALLOWED_EMPTY", message: "allowed_outputs cannot be empty." });
  }
  if (m.sealed && m.memory_scope === "ephemeral") {
    findings.push({ level: "warn", code: "SEALED_EPHEMERAL", message: "Sealed + ephemeral is unusual. Sealing implies persistence." });
  }
  return findings;
}

export function classifyOutput(output: string, forbidden: string[]): { violations: string[] } {
  const v: string[] = [];
  const lower = output.toLowerCase();

  const heuristics: Record<string, RegExp[]> = {
    speculation: [/i (think|guess|suspect)/i, /probably/i, /might be/i, /could be/i],
    creativity: [/once upon/i, /in a world/i, /story/i, /poem/i],
    claims_without_evidence: [/definitely/i, /guaranteed/i, /always/i],
  };

  for (const f of forbidden) {
    const patterns = heuristics[f];
    if (!patterns) continue;
    if (patterns.some((re) => re.test(lower))) v.push(f);
  }

  return { violations: v };
}
