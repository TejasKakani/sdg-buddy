import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  TOKEN_SECRET: z.string().min(32, "TOKEN_SECRET must be at least 32 characters"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DOMAIN: z.string().url("DOMAIN must be a valid URL"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  MAIL_FROM: z.string().email("MAIL_FROM must be a valid email").optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  HUGGINGFACE_API_KEY: z.string().optional(),
  HUGGINGFACE_MODEL: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  // Optional: enables durable, cross-instance rate limiting on serverless.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  DOMAIN: process.env.DOMAIN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  MAIL_FROM: process.env.MAIL_FROM,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  HUGGINGFACE_MODEL: process.env.HUGGINGFACE_MODEL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${formatted}`);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
