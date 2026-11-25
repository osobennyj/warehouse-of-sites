import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LLM_PROVIDER: z.enum(["anthropic", "openai", "mock"]).default("mock"),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  ETHPLORER_API_KEY: z.string().default("freekey"),
  NEXT_PUBLIC_BASE_PATH: z.string().default(""),
  NEXT_PUBLIC_STATIC_DEMO: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(overrides: Record<string, string | undefined> = {}): AppEnv {
  return EnvSchema.parse({ ...process.env, ...overrides });
}

export function hasLiveLlm(env: AppEnv): boolean {
  if (env.LLM_PROVIDER === "mock") return false;
  if (env.LLM_PROVIDER === "anthropic") return Boolean(env.ANTHROPIC_API_KEY);
  return Boolean(env.OPENAI_API_KEY);
}