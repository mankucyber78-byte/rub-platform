import type {
  AnalysisResult,
  CriticResult,
  RevenueEstimate,
  ScoutResult,
  SeoResult,
} from "./types";

export function computeScores(
  scout: ScoutResult,
  critic: CriticResult,
  seo: SeoResult
): AnalysisResult["scores"] {
  const speedScore = Math.max(
    1,
    Math.min(10, Math.round(10 - scout.pageLoadTimeMs / 1000))
  );
  const mobileScore = Math.max(
    1,
    Math.min(10, critic.mobileReadiness)
  );
  const designScore = Math.max(1, Math.min(10, critic.overallDesign));
  const seoScore = Math.max(1, Math.min(10, Math.round(seo.score / 10)));
  const contentScore = scout.textContent.length > 500 ? 6 : scout.textContent.length > 200 ? 4 : 2;
  const imageScore = Math.max(
    1,
    Math.min(10, 10 - Math.min(scout.imagesWithoutAlt, 9))
  );
  const overall = Math.round(
    (designScore +
      mobileScore +
      speedScore +
      seoScore +
      contentScore +
      imageScore) *
      (100 / 60)
  );

  return {
    overall: Math.min(100, Math.max(10, overall)),
    design: designScore,
    mobile: mobileScore,
    speed: speedScore,
    seo: seoScore,
    content: contentScore,
    image: imageScore,
  };
}

export function computeImprovedScores(
  scores: AnalysisResult["scores"]
): AnalysisResult["improvedScores"] {
  return {
    design: Math.min(10, scores.design + 6),
    mobile: Math.min(10, scores.mobile + 8),
    speed: Math.min(10, scores.speed + 5),
    seo: Math.min(10, scores.seo + 3),
  };
}

export function computeRevenueEstimate(
  scores: AnalysisResult["scores"]
): RevenueEstimate {
  const gap = Math.max(0, 80 - scores.overall);
  const customersLostPerMonth = Math.round(gap * 0.8);
  const revenueLostPerMonth = customersLostPerMonth * 50;

  return {
    customersLostPerMonth,
    revenueLostPerMonth,
    disclaimer:
      "Estimates are based on industry benchmarks and your website scores. Actual results vary by business, market, and traffic.",
  };
}
