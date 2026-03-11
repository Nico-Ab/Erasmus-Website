import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  AUTH_TRUST_HOST: z.union([z.literal("true"), z.literal("false")]).default("true"),
  STORAGE_DRIVER: z.string().default("local"),
  STORAGE_LOCAL_ROOT: z.string().default("./storage"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(15),
  ALLOWED_UPLOAD_EXTENSIONS: z.string().default("pdf,doc,docx"),
  DEFAULT_LOCALE: z.string().default("en")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = {
  ...parsed.data,
  trustHost: parsed.data.AUTH_TRUST_HOST === "true",
  allowedUploadExtensions: parsed.data.ALLOWED_UPLOAD_EXTENSIONS.split(",")
    .map((extension) => extension.trim())
    .filter(Boolean),
  storageLocalRoot: path.resolve(process.cwd(), parsed.data.STORAGE_LOCAL_ROOT)
};
