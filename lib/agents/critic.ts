import { claudeJson } from "@/lib/ai/claude";
import type { CriticResult, ScoutResult } from "./types";

export async function runCritic(scout: ScoutResult): Promise<CriticResult> {
  return claudeJson<CriticResult>(
    "You are a web design critic. Score 1-10 honestly. Quote HTML evidence. Return JSON only.",
    `Rate this website design. Return JSON:
{
  "overallDesign": number,
  "colors": number,
  "typography": number,
  "layout": number,
  "mobileReadiness": number,
  "problems": [{ "issue": string, "evidence": string }]
}

Has viewport meta: ${scout.hasMetaViewport}
Has H1: ${scout.hasH1}
Images without alt: ${scout.imagesWithoutAlt}
Load time ms: ${scout.pageLoadTimeMs}
Brand colors found: ${scout.brandColors.join(", ")}

HTML excerpt:
${scout.html.slice(0, 12000)}

CSS excerpt:
${scout.css.slice(0, 8000)}`
  );
}
