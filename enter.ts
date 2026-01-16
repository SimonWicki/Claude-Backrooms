import ora from "ora";
import { err, ok } from "../util/terminal.js";
import { existsRoom, readManifest, readState, writeState, appendEvent, readEvents, hashText, writeManifest } from "../storage/roomStore.js";
import { getAdapter } from "../adapters/index.js";
import { classifyOutput } from "../rules/validator.js";

export async function enterRoom(roomId: string, opts: any) {
  if (!existsRoom(roomId)) {
    console.log(err(`Room not found: ${roomId}`));
    process.exitCode = 1;
    return;
  }

  const manifest = readManifest(roomId);
  if (manifest.sealed) {
    console.log(err(`Room is sealed: ${roomId}`));
    process.exitCode = 1;
    return;
  }

  const input = opts.in as string;
  const adapterName = opts.adapter as string;

  const state = readState(roomId);
  const history = readEvents(roomId, 80);

  appendEvent(roomId, "enter", { input, adapter: adapterName });

  const spin = ora(`Entering ${roomId} (${adapterName})`).start();
  try {
    const adapter = getAdapter(adapterName);
    const res = await adapter.generate({ room: manifest, input, history });
    spin.succeed(`Output received (${adapter.name})`);

    appendEvent(roomId, "output", { output: res.output, meta: res.meta ?? {} });

    const { violations } = classifyOutput(res.output, manifest.forbidden);
    if (violations.length > 0) {
      appendEvent(roomId, "violation", { violations, sample: res.output.slice(0, 140) });
      state.violations += 1;
      state.entropy += 0.15 + violations.length * 0.05;
    } else {
      state.entropy += 0.02; // interaction cost
    }

    // mutation increases with entropy pressure
    state.enters += 1;
    state.mutation_level = Math.min(1, state.mutation_level + Math.max(0, state.entropy - 0.5) * 0.01);
    state.last_output_hash = hashText(res.output).slice(0, 16);
    state.last_summary = res.output.split("\n").slice(0, 6).join("\n");
    state.updated_at = new Date().toISOString();
    writeState(state);

    // keep manifest mutation in sync (operator-facing)
    manifest.mutation_level = state.mutation_level;
    writeManifest(manifest);

    console.log("\n" + res.output + "\n");
    if (violations.length > 0) console.log(err(`Violations: ${violations.join(", ")}`));
    console.log(ok(`entropy=${state.entropy.toFixed(2)} mutation=${state.mutation_level.toFixed(2)}`));
  } catch (e: any) {
    spin.fail("Adapter failed");
    console.log(err(String(e?.message ?? e)));
    process.exitCode = 1;
  }
}
