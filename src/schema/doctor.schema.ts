import { z } from "zod";

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

export const doctorSchema = z.object({
  therapyId: z.enum([
    "physodynamic",
    "behavioural",
    "cognitiveBehavioural",
    "humanistic",
  ]),
  name: z.string().trim().min(1),
  email: z.string().trim().min(1).email(),
  avatarUrl: z.string(),
  experience: z.string(),
  specialistIn: z.string(),
  about: z.string(),
});

export type DoctorSchema = z.infer<typeof doctorSchema>;
