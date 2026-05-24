import { runScout } from "@/lib/agents/scout";
import {
  computeRevenueEstimate,
  computeScores,
} from "@/lib/agents/scores";
import type { AutopsyResult, CriticResult, SeoResult } from "@/lib/agents/types";
import { claudeText } from "@/lib/ai/claude";
import { normalizeUrl } from "@/lib/rub-storage";

export const runtime = "nodejs";
export const maxDuration = 120;

async function runLighthouse(url: string) {
  try {
    const chromeLauncher = await import("chrome-launcher");
    const lighthouse = (await import("lighthouse")).default;

    const chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--no-sandbox"],
    });

    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);
    await chrome.kill();

    const lhr = runnerResult?.lhr;
    if (!lhr) throw new Error("Lighthouse failed");

    return {
      performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round(
        (lhr.categories.accessibility?.score ?? 0) * 100
      ),
      bestPractices: Math.round(
        (lhr.categories["best-practices"]?.score ?? 0) * 100
      ),
      seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
    };
  } catch {
    return {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
    };
  }
}

export async function POST(request: Request) {
  try {
    const { url: rawUrl } = (await request.json()) as { url?: string };
    const url = normalizeUrl(rawUrl ?? "");

    if (!url) {
      return Response.json(
        { error: "Please enter a valid website URL." },
        { status: 400 }
      );
    }

    const scout = await runScout(url);
    const lighthouse = await runLighthouse(url);

    const critic: CriticResult = {
      overallDesign: Math.max(1, Math.min(10, Math.round(lighthouse.performance / 10))),
      colors: 5,
      typography: 5,
      layout: 5,
      mobileReadiness: scout.hasMetaViewport ? 7 : 3,
      problems: [],
    };

    const seoGuy: SeoResult = {
      score: lighthouse.seo,
      issues: [],
      metaTags: {
        title: scout.title,
        description: scout.metaDescription,
      },
      headingStructure: scout.hasH1 ? ["H1 found"] : [],
      recommendations: [],
    };

    if (!scout.hasSsl) {
      seoGuy.issues.push({ issue: "Site is not using HTTPS", severity: "high" });
    }
    if (!scout.hasMetaDescription) {
      seoGuy.issues.push({
        issue: "Missing meta description",
        severity: "high",
      });
    }
    if (scout.imagesWithoutAlt > 0) {
      seoGuy.issues.push({
        issue: `${scout.imagesWithoutAlt} images missing alt text`,
        severity: "medium",
      });
    }

    const scores = computeScores(scout, critic, seoGuy);
    const revenueEstimate = computeRevenueEstimate(scores);

    const analysis = await claudeText(
      "You write honest, fair website audits. Good sites get praise. Bad sites get constructive criticism. No fake negativity.",
      `Write an honest website autopsy report for ${url}.

Lighthouse: ${JSON.stringify(lighthouse)}
Scout findings: SSL=${scout.hasSsl}, load=${scout.pageLoadTimeMs}ms, H1=${scout.hasH1}, viewport=${scout.hasMetaViewport}
Scores: ${JSON.stringify(scores)}
Revenue estimate context: ${JSON.stringify(revenueEstimate)}

Be specific, fair, and actionable.`
    );

    const result: AutopsyResult = {
      url,
      completedAt: new Date().toISOString(),
      lighthouse,
      scout,
      analysis,
      scores,
      revenueEstimate,
      honestSummary: analysis.split("\n")[0] ?? "Website autopsy complete.",
    };

    return Response.json(result);
  } catch {
    return Response.json(
      {
        error:
          "Oops! Something went wrong. Don't worry — your website is safe. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
