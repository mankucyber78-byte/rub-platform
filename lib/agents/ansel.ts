import { openaiVisionJson } from "@/lib/ai/openai";
import type { AnalyzeRequest, PhotoPlacement } from "./types";

export async function runAnsel(
  photos?: AnalyzeRequest["photos"]
): Promise<{ placements: PhotoPlacement[] }> {
  if (!photos?.length) {
    return { placements: [] };
  }

  const images = photos.slice(0, 10).map((p) => ({
    base64: p.base64.replace(/^data:[^;]+;base64,/, ""),
    mimeType: p.mimeType,
  }));

  return openaiVisionJson<{ placements: PhotoPlacement[] }>(
    "Analyze business photos and decide website placement. Return JSON: { placements: [{ filename, description, placement (hero|about|services|gallery|testimonials), confidence }] }",
    `Analyze each uploaded photo and assign the best section placement.`,
    images
  );
}
