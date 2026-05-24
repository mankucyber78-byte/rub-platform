import { claudeJson } from "@/lib/ai/claude";
import type { BusinessProfile, ScoutResult, WriterResult } from "./types";

export async function runWriter(
  scout: ScoutResult,
  profile: BusinessProfile
): Promise<WriterResult> {
  return claudeJson<WriterResult>(
    "You rewrite website copy to convert better. Match business personality. Return JSON only.",
    `Rewrite content for this ${profile.businessType} (${profile.personality} tone).
Return JSON: heroHeadline, heroSubheadline, ctaText, aboutSection.

Current title: ${scout.title}
Current H1: ${scout.h1Text}
Target audience: ${profile.targetAudience}
Location: ${profile.location}

Existing text:
${scout.textContent.slice(0, 8000)}`
  );
}
