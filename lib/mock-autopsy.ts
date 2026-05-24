import { displayUrl } from "@/lib/rub-storage";

export type AutopsyProblem = {
  issue: string;
  evidence: string;
  severity: "high" | "medium" | "low";
};

export type TechnicalCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type MockAutopsyReport = {
  url: string;
  domain: string;
  completedAt: string;
  overallScore: number;
  scores: {
    design: number;
    mobile: number;
    speed: number;
    seo: number;
    content: number;
    image: number;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  problems: AutopsyProblem[];
  technicalChecks: TechnicalCheck[];
  revenueLostPerMonth: number;
  dailyLoss: number;
  customersLostPerMonth: number;
  revenueFormula: string;
  honestSummary: string;
  shareUrl: string;
};

export const AUTOPSY_LOADING_STEPS = [
  { icon: "⏳", label: "Opening your website..." },
  { icon: "⏳", label: "Running performance scan..." },
  { icon: "⏳", label: "Checking all pages..." },
  { icon: "⏳", label: "Analyzing problems..." },
  { icon: "⏳", label: "Calculating revenue impact..." },
  { icon: "✅", label: "Report ready!" },
] as const;

export function generateMockAutopsyReport(url: string): MockAutopsyReport {
  const domain = displayUrl(url);
  const slug = domain.replace(/\./g, "-");
  const overallScore = 34 + (domain.length % 12);

  return {
    url,
    domain,
    completedAt: new Date().toISOString(),
    overallScore,
    scores: {
      design: 3,
      mobile: 2,
      speed: 4,
      seo: 5,
      content: 4,
      image: 3,
    },
    lighthouse: {
      performance: 38,
      accessibility: 52,
      bestPractices: 61,
      seo: 44,
    },
    problems: [
      {
        issue: "Homepage loads in 4.2 seconds on mobile",
        evidence:
          "Google Lighthouse measured LCP at 4.2s — 68% of visitors leave before 3 seconds.",
        severity: "high",
      },
      {
        issue: "No mobile viewport meta tag detected",
        evidence:
          "Site renders at desktop width on phones — text requires pinch-zoom to read.",
        severity: "high",
      },
      {
        issue: "9 images missing alt text",
        evidence:
          "Accessibility audit found 9 images without alt attributes across 8 pages.",
        severity: "medium",
      },
      {
        issue: "Missing LocalBusiness schema markup",
        evidence:
          "No structured data found — Google cannot display rich results for your business.",
        severity: "high",
      },
      {
        issue: "Primary CTA buried below the fold on mobile",
        evidence:
          "Contact button appears after 2.5 screen scrolls on iPhone 14 viewport.",
        severity: "medium",
      },
    ],
    technicalChecks: [
      { label: "SSL certificate valid", passed: true, detail: "HTTPS active" },
      { label: "Mobile viewport tag", passed: false, detail: "Missing viewport meta" },
      { label: "Meta descriptions", passed: false, detail: "4 pages missing descriptions" },
      { label: "Page load under 3s", passed: false, detail: "Measured 4.2s on mobile" },
      { label: "Image alt text", passed: false, detail: "9 images without alt" },
      { label: "H1 tag present", passed: true, detail: "Found on homepage" },
      { label: "Schema markup", passed: false, detail: "No structured data" },
      { label: "Google Analytics", passed: false, detail: "Not detected" },
      { label: "Broken links", passed: false, detail: "2 broken internal links" },
      { label: "Copyright year current", passed: false, detail: "Footer shows 2019" },
      { label: "Phone number visible", passed: true, detail: "Found in header" },
      { label: "Contact form working", passed: true, detail: "Form submits successfully" },
      { label: "Favicon present", passed: true, detail: "Favicon detected" },
      { label: "Robots.txt valid", passed: true, detail: "Allows indexing" },
      { label: "Core Web Vitals pass", passed: false, detail: "LCP and CLS failing" },
    ],
    revenueLostPerMonth: 2350,
    dailyLoss: 78,
    customersLostPerMonth: 47,
    revenueFormula:
      "47 estimated lost customers × $50 avg. transaction = $2,350/month based on your traffic tier and conversion benchmarks.",
    honestSummary:
      `${domain} has a dated frontend that fails mobile and speed benchmarks. Fixing design alone won't recover traffic — you need a full frontend modernization.`,
    shareUrl: `https://rub.app/report/${slug}-${Date.now().toString(36)}`,
  };
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
