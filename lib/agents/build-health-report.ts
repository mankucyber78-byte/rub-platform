import type { AnalysisResult } from "./types";

type ScoreColor = "red" | "orange" | "green";

function scoreColor(value: number, max: number): ScoreColor {
  const pct = value / max;
  if (pct <= 0.4) return "red";
  if (pct <= 0.7) return "orange";
  return "green";
}

export function buildHealthScores(analysis: AnalysisResult) {
  const { scores, critic, seoGuy, scout } = analysis;

  const designIssue =
    critic.problems[0]?.issue ??
    "Design needs modernization for better user trust and conversions.";
  const mobileIssue = scout.hasMetaViewport
    ? critic.problems.find((p) => p.issue.toLowerCase().includes("mobile"))
        ?.issue ?? "Mobile experience could be improved."
    : "Missing viewport meta tag — site is not mobile-friendly.";
  const speedIssue = `Page loaded in ${(scout.pageLoadTimeMs / 1000).toFixed(1)}s — ${
    scout.pageLoadTimeMs > 3000 ? "too slow for modern visitors" : "acceptable but improvable"
  }.`;
  const seoIssue =
    seoGuy.issues[0]?.issue ??
    seoGuy.recommendations[0] ??
    "SEO structure needs improvement.";
  const contentIssue =
    scout.textContent.length < 300
      ? "Very little content found — visitors lack information to convert."
      : "Content could be clearer with stronger calls-to-action.";
  const imageIssue =
    scout.imagesWithoutAlt > 0
      ? `${scout.imagesWithoutAlt} images missing alt text — hurts accessibility and SEO.`
      : "Image quality and placement could be optimized.";

  return [
    {
      label: "Overall Score",
      value: scores.overall,
      max: 100,
      color: scoreColor(scores.overall, 100),
      issue:
        scores.overall < 60
          ? "Site underperforms on key metrics — redesign recommended."
          : "Solid foundation with room for meaningful improvements.",
    },
    {
      label: "Design Score",
      value: scores.design,
      max: 10,
      color: scoreColor(scores.design, 10),
      issue: designIssue,
    },
    {
      label: "Mobile Score",
      value: scores.mobile,
      max: 10,
      color: scoreColor(scores.mobile, 10),
      issue: mobileIssue,
    },
    {
      label: "Speed Score",
      value: scores.speed,
      max: 10,
      color: scoreColor(scores.speed, 10),
      issue: speedIssue,
    },
    {
      label: "SEO Score",
      value: scores.seo,
      max: 10,
      color: scoreColor(scores.seo, 10),
      issue: seoIssue,
    },
    {
      label: "Content Score",
      value: scores.content,
      max: 10,
      color: scoreColor(scores.content, 10),
      issue: contentIssue,
    },
    {
      label: "Image Score",
      value: scores.image,
      max: 10,
      color: scoreColor(scores.image, 10),
      issue: imageIssue,
    },
  ] as const;
}

export function buildScoreImprovements(analysis: AnalysisResult) {
  const { scores, improvedScores } = analysis;
  return [
    {
      label: "Design",
      before: scores.design,
      after: improvedScores.design,
    },
    {
      label: "Mobile",
      before: scores.mobile,
      after: improvedScores.mobile,
    },
    {
      label: "Speed",
      before: scores.speed,
      after: improvedScores.speed,
    },
    {
      label: "SEO",
      before: scores.seo,
      after: improvedScores.seo,
    },
  ];
}
