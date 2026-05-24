import { geminiJson } from "@/lib/ai/gemini";
import type { ScoutResult, SeoResult } from "./types";

export async function runSeoGuy(scout: ScoutResult): Promise<SeoResult> {
  return geminiJson<SeoResult>(
    "You are an SEO auditor. Be honest and specific. Return JSON only.",
    `Audit this HTML for SEO. Return JSON:
{
  "score": number (0-100),
  "issues": [{ "issue": string, "severity": "high"|"medium"|"low" }],
  "metaTags": { "title": string|null, "description": string|null, ... },
  "headingStructure": string[],
  "recommendations": string[]
}

URL: ${scout.url}
Has SSL: ${scout.hasSsl}
Has schema: ${scout.hasSchemaMarkup}
Broken links sample: ${scout.brokenLinks}
Images missing alt: ${scout.imagesWithoutAlt}

HTML:
${scout.html.slice(0, 50000)}`
  );
}
