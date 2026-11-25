import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import type { Analysis, Facts, Score, TokenRef } from "@/entities/report";
import { AnalysisSchema } from "@/entities/report";
import type { AppEnv } from "@/server/config/env";
import { createMockAnalysis } from "./mock-analysis";

const PROMPT_VERSION = "analysis-v1";

export interface AnalysisProvider {
  generate(params: {
    token: TokenRef;
    facts: Facts;
    score: Score;
    sourcesJson: string;
  }): Promise<{ analysis: Analysis; model: string; provider: string; usage: { inputTokens: number; outputTokens: number } }>;
}

export function createAnalysisProvider(env: AppEnv): AnalysisProvider {
  if (env.LLM_PROVIDER === "mock" || !hasProviderKey(env)) {
    return {
      async generate({ token, facts, score }) {
        return {
          analysis: createMockAnalysis(token, facts, score),
          model: "mock-template",
          provider: "mock",
          usage: { inputTokens: 0, outputTokens: 0 },
        };
      },
    };
  }

  const model =
    env.LLM_MODEL ??
    (env.LLM_PROVIDER === "anthropic" ? "claude-sonnet-4-6" : "gpt-5.4-mini");
  const languageModel =
    env.LLM_PROVIDER === "anthropic"
      ? createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })(model)
      : createOpenAI({ apiKey: env.OPENAI_API_KEY })(model);

  return {
    async generate({ token, facts, score, sourcesJson }) {
      const result = await generateText({
        model: languageModel,
        output: Output.object({ schema: AnalysisSchema }),
        system: [
          "You are a crypto research analyst writing a due-diligence memo.",
          "Rules:",
          "- Do NOT invent numeric values. Only cite numbers that appear in the FACTS JSON.",
          "- Every bullet in catalysts/risks/redFlags MUST reference valid sourceIds from the SOURCES list.",
          "- Be concise, concrete, and skeptical. This is not financial advice.",
        ].join("\n"),
        prompt: [
          `Token: ${token.name} (${token.symbol}), id=${token.id}`,
          `Composite score (precomputed): ${score.total}/100 grade ${score.grade}`,
          `FACTS JSON:\n${JSON.stringify(facts, null, 2)}`,
          `SOURCES:\n${sourcesJson}`,
        ].join("\n\n"),
      });

      return {
        analysis: AnalysisSchema.parse(result.output),
        model,
        provider: env.LLM_PROVIDER,
        usage: {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
        },
      };
    },
  };
}

export { PROMPT_VERSION };

function hasProviderKey(env: AppEnv) {
  return env.LLM_PROVIDER === "anthropic"
    ? Boolean(env.ANTHROPIC_API_KEY)
    : Boolean(env.OPENAI_API_KEY);
}