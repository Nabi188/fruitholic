import { z } from "zod";
import chalk from "chalk";

const envSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Missing SUPABASE_SERVICE_ROLE_KEY"),
  SEPAY_API_KEY: z.string().min(1, "Missing SEPAY_API_KEY"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "Missing CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: z.string().min(1, "Missing CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: z.string().min(1, "Missing CLOUDINARY_API_SECRET"),
  SMTP_HOST: z.string().min(1, "Missing SMTP_HOST"),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().min(1, "Missing SMTP_USER"),
  SMTP_PASS: z.string().min(1, "Missing SMTP_PASS"),
  SMTP_FROM: z.string().min(1, "Missing SMTP_FROM"),
  NOTIFICATION_EMAIL: z.string().min(1, "Missing NOTIFICATION_EMAIL"),
  BANK_ID: z.string().min(1, "Missing BANK_ID"),
  BANK_ACCOUNT_NO: z.coerce.number().min(1, "Missing BANK_ACCOUNT_NO"),
  BANK_ACCOUNT_NAME: z.string().min(1, "Missing BANK_ACCOUNT_NAME"),
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.warn(
        chalk.yellow.bold(
          "\n⚠️  Some environment variables are missing or invalid:\n",
        ),
      );
      result.error.issues.forEach((issue) => {
        console.warn(
          chalk.yellow(
            `  • ${chalk.bold(issue.path.join("."))} — ${issue.message}`,
          ),
        );
      });
      console.warn(
        chalk.dim("\nFill in your .env file. Some features may not work.\n"),
      );
      return process.env as unknown as EnvConfig;
    } else {
      console.error(
        chalk.red.bold("\n❌ Environment variable validation failed:\n"),
      );
      result.error.issues.forEach((issue) => {
        console.error(
          chalk.red(
            `  • ${chalk.bold(issue.path.join("."))} — ${issue.message}`,
          ),
        );
      });
      console.error(
        chalk.yellow("\nPlease set all required environment variables.\n"),
      );
      process.exit(1);
    }
  }

  return result.data;
}

export const envConfig = validateEnv();
