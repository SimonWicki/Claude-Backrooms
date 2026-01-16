import type { LLMAdapter } from "./types.js";

/**
 * ClaudeAdapter is intentionally a skeleton.
 *
 * Wire this up to your preferred Claude client.
 * Keep the interface stable so the rest of the repo remains provider-agnostic.
 *
 * Expected behavior:
 * - Use `room.ruleset`, `allowed_outputs`, `forbidden`, and `memory_scope` to form the system prompt.
 * - Use `history` to provide context (bounded).
 * - Return raw output text in `output`.
 */
export const ClaudeAdapter: LLMAdapter = {
  name: "claude",
  async generate() {
    throw new Error(
      "ClaudeAdapter not configured. Implement src/adapters/claude.ts with your provider client, then re-run."
    );
  },
};
