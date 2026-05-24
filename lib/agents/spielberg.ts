import { openaiJson } from "@/lib/ai/openai";
import type { AnalyzeRequest, VideoPlan } from "./types";

export async function runSpielberg(
  videos?: AnalyzeRequest["videos"]
): Promise<{ videos: VideoPlan[] }> {
  if (!videos?.length) {
    return { videos: [] };
  }

  return openaiJson<{ videos: VideoPlan[] }>(
    "You plan video placement for business websites. Return JSON only.",
    `Plan placement for these uploaded videos:
${JSON.stringify(videos.slice(0, 5), null, 2)}

Return JSON: { videos: [{ filename, contentType, placement, trimStart?, trimEnd?, notes }] }`
  );
}
