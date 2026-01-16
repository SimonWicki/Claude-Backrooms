import fs from "node:fs";
import path from "node:path";
import { ensureDir, GRAPH_DIR } from "../config/paths.js";
import { listRooms, readManifest, readState } from "../storage/roomStore.js";
import { ok } from "../util/terminal.js";

type GraphNode = {
  id: string;
  ruleset: string;
  sealed: boolean;
  entropy: number;
  mutation: number;
  parent?: string;
};

type Graph = { nodes: GraphNode[]; edges: { from: string; to: string; kind: string }[] };

function buildGraph(): Graph {
  const nodes: GraphNode[] = [];
  const edges: Graph["edges"] = [];

  for (const id of listRooms()) {
    const m = readManifest(id);
    const s = readState(id);
    nodes.push({
      id,
      ruleset: m.ruleset,
      sealed: m.sealed,
      entropy: s.entropy,
      mutation: m.mutation_level ?? 0,
      parent: m.lineage?.parent,
    });

    if (m.lineage?.parent) {
      edges.push({ from: m.lineage.parent, to: id, kind: "fork" });
    }
  }

  return { nodes, edges };
}

function toMermaid(g: Graph) {
  const lines: string[] = [];
  lines.push("graph TD");
  for (const n of g.nodes) {
    const label = `${n.id}\n${n.ruleset}\nentropy=${n.entropy.toFixed(2)}\nmut=${n.mutation.toFixed(2)}`;
    const cls = n.sealed ? "sealed" : "open";
    lines.push(`  ${safe(n.id)}["${label}"]:::${cls}`);
  }
  for (const e of g.edges) {
    lines.push(`  ${safe(e.from)} -->|${e.kind}| ${safe(e.to)}`);
  }
  lines.push("");
  lines.push("classDef open fill:#0b1,stroke:#0f0,color:#000");
  lines.push("classDef sealed fill:#333,stroke:#999,color:#fff");
  return lines.join("\n");
}

function safe(id: string) {
  return "R_" + id.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function exportGraph(opts: any) {
  ensureDir(GRAPH_DIR);
  const g = buildGraph();
  const jsonPath = path.join(GRAPH_DIR, "rooms.json");
  fs.writeFileSync(jsonPath, JSON.stringify(g, null, 2), "utf-8");

  if ((opts.format ?? "json") === "mermaid") {
    const mmdPath = path.join(GRAPH_DIR, "rooms.mmd");
    fs.writeFileSync(mmdPath, toMermaid(g), "utf-8");
    console.log(ok(`Wrote ${mmdPath}`));
  }

  console.log(ok(`Wrote ${jsonPath}`));
}
