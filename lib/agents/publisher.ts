import { claudeText } from "@/lib/ai/claude";
import type {
  BusinessProfile,
  DesignSystem,
  PublisherResult,
  WriterResult,
} from "./types";

export async function runPublisher(
  design: DesignSystem,
  writer: WriterResult,
  profile: BusinessProfile
): Promise<PublisherResult> {
  const css = await claudeText(
    "You generate production-ready mobile-first CSS using CSS variables. Output ONLY raw CSS, no markdown.",
    `Generate complete CSS for a ${profile.businessType} website redesign.

Design system:
${JSON.stringify(design, null, 2)}

Content:
Headline: ${writer.heroHeadline}
Subheadline: ${writer.heroSubheadline}
CTA: ${writer.ctaText}

Requirements:
- Mobile first
- CSS variables for all colors/fonts
- Animation keyframes matching animationStyle
- Styles for: header, hero, about, services, gallery, testimonials, footer, buttons
- Minimum 200 lines of quality CSS`
  );

  return { css: css.replace(/^```css?\n?/i, "").replace(/```$/i, "").trim() };
}
