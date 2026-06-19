import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const signInSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const verifyEmailTokenSchema = z.object({
  token: z.string().trim().min(20).max(256),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const actionLogSchema = z.object({
  description: z.string().trim().min(3).max(1000),
});

export const recommendationRequestSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
});
