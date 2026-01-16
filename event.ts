import { z } from "zod";

export const EventKind = z.enum(["enter", "output", "violation", "fork", "seal"]);

export const EventSchema = z.object({
  id: z.string(),
  ts: z.string(),
  kind: EventKind,
  room_id: z.string(),
  payload: z.record(z.any()),
});

export type Event = z.infer<typeof EventSchema>;
