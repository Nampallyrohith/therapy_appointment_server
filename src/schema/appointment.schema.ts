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
  hangoutLink: z.string().trim().min(1).url(),
  doctorId: z.number(),
  eventId: z.string(),
  therapyType: z.string(),
});

export type doctorType = {
  id: string;
  therapy_id: string;
  name: string;
  email: string;
  avatar_url: string;
  experience: number;
  specialist_in: string;
  about: string;
};

export type EventSchema = z.infer<typeof eventSchema>;
