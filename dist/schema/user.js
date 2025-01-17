import { z } from "zod";
export const authenicationSchema = z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().trim().min(8, "Password must be atleast 8 characters"),
});
export const signupSchema = authenicationSchema.extend({
    fullName: z.string().trim().min(1, "name is required"),
});
export const loginSchema = authenicationSchema.extend({});
