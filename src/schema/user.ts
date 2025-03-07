import { z } from "zod";

export const authenicationSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().trim().min(8, "Password must be atleast 8 characters"),
});

export const signupSchema = authenicationSchema.extend({
  fullName: z.string().trim().min(1, "name is required"),
});

export const loginSchema = authenicationSchema.extend({});

export const googleAuthSchema = z.object({
  authCode: z.string().trim().min(1, "Credential is required..."),
});

export const UserSchema = z.object({
  googleUserId: z.string(),
  name: z.string(),
  email: z.string(),
  providerToken: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  phone: z.string().nullable(),
  gender: z.string().nullable(),
  dob: z.string().nullable(),
  createdAt: z.string(),
  lastSignInAt: z.string().nullable(),
  refreshToken: z.string().nullable(),
  accessToken: z.string().nullable(),
  expiresAt: z.number().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;
