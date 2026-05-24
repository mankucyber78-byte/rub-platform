import { claudeJson } from "@/lib/ai/claude";
import type { BusinessProfile, ScoutResult } from "./types";

export async function runEinstein(scout: ScoutResult): Promise<BusinessProfile> {
  return claudeJson<BusinessProfile>(
    "You analyze websites and return business profiles as JSON only.",
    `Analyze this website and return JSON with keys:
businessType, subCategory, personality (formal|casual|mixed),
pricePoint (budget|mid|premium|unknown), targetAudience, location, summary.

URL: ${scout.url}
Title: ${scout.title}
H1: ${scout.h1Text}
Meta: ${scout.metaDescription}
Phone visible: ${scout.phoneVisible}
Address visible: ${scout.addressVisible}
Text sample:
${scout.textContent.slice(0, 6000)}`
  );
}
