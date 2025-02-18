import { z } from "zod";

export interface therapy {
  id: string;
  therapy_name: string;
}

export const eventSchema = z.object({
  summary: z.string(),
  description: z.string(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  attendees: z.array(
    z.object({
      email: z.string().trim().min(1).email(),
    })
  ),
  hangoutLink: z.string(),
});

export type EventSchema = z.infer<typeof eventSchema>;
