import { claudeJson } from "@/lib/ai/claude";
import type {
  AnalyzeRequest,
  BusinessProfile,
  DesignSystem,
  ScoutResult,
} from "./types";

export async function runPicasso(
  scout: ScoutResult,
  profile: BusinessProfile,
  photos?: AnalyzeRequest["photos"]
): Promise<DesignSystem> {
  const seed = `${scout.url}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const photoTypes =
    photos?.map((p) => p.name).join(", ") || "none uploaded yet";

  return claudeJson<DesignSystem>(
    "You create unique design systems for businesses. Never repeat designs. Return JSON only.",
    `Create a completely unique design system for this business.
Use seed ${seed} to ensure uniqueness.

Business: ${profile.businessType} / ${profile.subCategory}
Personality: ${profile.personality}
Location: ${profile.location}
Existing brand colors from site: ${scout.brandColors.join(", ")}
Photo types: ${photoTypes}

Return JSON:
{
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "accentColor": "#hex",
  "backgroundColor": "#hex",
  "textColor": "#hex",
  "headingFont": "font stack",
  "bodyFont": "font stack",
  "borderRadius": "value",
  "animationStyle": "description",
  "layoutStructure": "description",
  "sectionOrder": string[],
  "heroStyle": "description",
  "uniquenessSeed": "${seed}"
}`
  );
}
