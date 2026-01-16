import type { RoomManifest } from "../schemas/room.js";
import type { Event } from "../schemas/event.js";

export type AdapterResult = {
  output: string;
  meta?: Record<string, any>;
};

export interface LLMAdapter {
  name: string;
  generate(args: { room: RoomManifest; input: string; history: Event[] }): Promise<AdapterResult>;
}
