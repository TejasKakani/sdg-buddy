import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9_]+$/, "Username may only contain lowercase letters, numbers, and underscores");

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(60),
  username: usernameSchema,
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

// Sign-in accepts either an email or a username in a single field.
export const signInSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(8).max(128),
});

export const verifyEmailTokenSchema = z.object({
  token: z.string().trim().min(20).max(256),
});

export const resendVerificationSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
});

export const actionLogSchema = z.object({
  description: z.string().trim().min(3).max(1000),
});

export const recommendationRequestSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
});

export const followSchema = z.object({
  username: usernameSchema,
});

export const friendSearchSchema = z.object({
  q: z.string().trim().min(1).max(30),
});
