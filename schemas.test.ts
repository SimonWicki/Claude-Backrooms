import { describe, it, expect } from "vitest";
import { RoomManifestSchema } from "../schemas/room.js";

describe("RoomManifestSchema", () => {
  it("parses a minimal manifest", () => {
    const m = RoomManifestSchema.parse({
      room_id: "L3-ARCHIVE-17",
      created_at: new Date().toISOString(),
      ruleset: "archival_only",
      memory_scope: "persistent",
      allowed_outputs: ["summaries"],
      forbidden: [],
      sealed: false,
      lineage: {},
      mutation_level: 0,
    });
    expect(m.room_id).toBe("L3-ARCHIVE-17");
  });
});
