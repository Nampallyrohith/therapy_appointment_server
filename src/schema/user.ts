import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().trim().min(8, "Password must be atleast 8 characters"),
});

