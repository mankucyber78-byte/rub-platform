import { claudeJson } from "@/lib/ai/claude";
import type {
  BusinessProfile,
  CriticResult,
  DesignSystem,
  RexResult,
  SeoResult,
  WriterResult,
} from "./types";

export async function runRex(input: {
  profile: BusinessProfile;
  critic: CriticResult;
  seo: SeoResult;
  writer: WriterResult;
  design: DesignSystem;
}): Promise<RexResult> {
  return claudeJson<RexResult>(
    "You are a QA agent reviewing website redesign outputs. Return JSON only.",
    `Review consistency across all agent outputs. Return JSON:
{ "passed": boolean, "score": number (0-100), "issues": string[], "recommendations": string[] }

Business profile: ${JSON.stringify(input.profile)}
Critic scores: ${JSON.stringify(input.critic)}
SEO score: ${input.seo.score}
Writer content: ${JSON.stringify(input.writer)}
Design system: ${JSON.stringify(input.design)}`
  );
}
