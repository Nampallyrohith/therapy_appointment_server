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
  experience: z.number(),
  specialistIn: z.string(),
  about: z.string(),
  qualification: z.string(),
  gender: z.enum(["Male", "Female"]),
  age: z.number(),
});

export const doctorAuthenticationSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().trim().min(1),
});

export const doctorSignupSchema = doctorAuthenticationSchema.extend({
  fullName: z.string().trim().min(1),
});

export const leaveDatesSchema = z.object({
  title: z.string(),
  description: z.string(),
  dates: z.string(),
});

export type DoctorSchema = z.infer<typeof doctorSchema>;
export type LeaveDatesSchema = z.infer<typeof leaveDatesSchema>;
