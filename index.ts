import { MockAdapter } from "./mock.js";
import { ClaudeAdapter } from "./claude.js";
import type { LLMAdapter } from "./types.js";

export function getAdapter(name: string): LLMAdapter {
  switch (name) {
    case "mock":
      return MockAdapter;
    case "claude":
      return ClaudeAdapter;
    default:
      return MockAdapter;
  }
}
