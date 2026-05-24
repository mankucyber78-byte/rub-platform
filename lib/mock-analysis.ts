import type { AgentName, AnalysisResult } from "@/lib/agents/types";
import { displayUrl } from "@/lib/rub-storage";

/** Agent run durations in milliseconds (UI-only mode). */
export const MOCK_AGENT_DURATIONS_MS: Record<AgentName, number> = {
  scout: 3000,
  einstein: 4000,
  critic: 3000,
  seoGuy: 4000,
  writer: 5000,
  picasso: 6000,
  ansel: 4000,
  spielberg: 4000,
  rex: 3000,
  publisher: 4000,
};

export const MOCK_TOTAL_DURATION_MS = Object.values(
  MOCK_AGENT_DURATIONS_MS
).reduce((a, b) => a + b, 0);

export const MOCK_AGENT_ORDER: AgentName[] = [
  "scout",
  "einstein",
  "critic",
  "seoGuy",
  "writer",
  "picasso",
  "ansel",
  "spielberg",
  "rex",
  "publisher",
];

type FeedStep = { at: number; message: string };

function inferBusiness(domain: string) {
  const d = domain.toLowerCase();
  if (/pizza|restaurant|cafe|grill|bistro|kitchen|diner|food/.test(d)) {
    return {
      type: "Restaurant",
      sub: "Casual dining",
      audience: "Local diners and families within 5 miles",
      personality: "casual" as const,
    };
  }
  if (/dental|dentist|clinic|medical|health|doctor|chiro/.test(d)) {
    return {
      type: "Healthcare Practice",
      sub: "Patient-focused clinic",
      audience: "Local patients seeking trusted care",
      personality: "formal" as const,
    };
  }
  if (/law|legal|attorney|firm/.test(d)) {
    return {
      type: "Professional Services",
      sub: "Law firm",
      audience: "Clients needing expert legal guidance",
      personality: "formal" as const,
    };
  }
  if (/salon|spa|beauty|hair|nail/.test(d)) {
    return {
      type: "Beauty & Wellness",
      sub: "Salon / spa",
      audience: "Style-conscious local clients",
      personality: "casual" as const,
    };
  }
  return {
    type: "Local Business",
    sub: "Service provider",
    audience: "Nearby customers searching online",
    personality: "mixed" as const,
  };
}

export function buildMockFeedSteps(domain: string): Record<AgentName, FeedStep[]> {
  const biz = inferBusiness(domain);

  return {
    scout: [
      { at: 0, message: `Scout connecting to ${domain}...` },
      { at: 18, message: "Scout found 8 pages to analyze..." },
      { at: 42, message: "Scout reading HTML, CSS, and page structure..." },
      { at: 68, message: "Scout detected outdated layout patterns on homepage" },
      { at: 92, message: "Scout captured homepage snapshot — scan complete ✅" },
    ],
    einstein: [
      { at: 0, message: "Einstein analyzing business signals from site content..." },
      { at: 22, message: `Einstein detected: ${biz.type} business` },
      { at: 48, message: `Einstein mapped audience: ${biz.audience}` },
      { at: 75, message: "Einstein identified conversion gaps in hero messaging" },
      { at: 95, message: "Einstein business profile complete ✅" },
    ],
    critic: [
      { at: 0, message: "Critic grading visual design quality..." },
      { at: 25, message: "Critic found 12 design issues on homepage" },
      { at: 52, message: "Critic flagged weak typography hierarchy" },
      { at: 80, message: "Critic scored mobile readiness: 2/10" },
      { at: 98, message: "Critic design audit complete ✅" },
    ],
    seoGuy: [
      { at: 0, message: "SEO Guy checking Google visibility signals..." },
      { at: 20, message: "SEO Guy found missing meta descriptions on 4 pages" },
      { at: 45, message: "SEO Guy detected slow LCP on mobile (4.2s)" },
      { at: 72, message: "SEO Guy found 8 ranking opportunities" },
      { at: 96, message: "SEO Guy audit complete — score 4/10 ✅" },
    ],
    writer: [
      { at: 0, message: "Writer reviewing homepage copy..." },
      { at: 18, message: "Writer rewriting hero headline for clarity..." },
      { at: 40, message: "Writer strengthening call-to-action language..." },
      { at: 62, message: "Writer polishing About section for trust..." },
      { at: 84, message: "Writer drafting service descriptions..." },
      { at: 98, message: "Writer content rewrite complete ✅" },
    ],
    picasso: [
      { at: 0, message: "Picasso generating your unique 2026 design system..." },
      { at: 15, message: "Picasso building color palette from brand signals..." },
      { at: 32, message: "Picasso designing modern hero layout..." },
      { at: 50, message: "Picasso crafting glass-style card components..." },
      { at: 68, message: "Picasso applying premium dark + gold accents..." },
      { at: 86, message: "Picasso finalizing section rhythm and spacing..." },
      { at: 98, message: "Picasso design system ready ✅" },
    ],
    ansel: [
      { at: 0, message: "Ansel scanning images across all pages..." },
      { at: 25, message: "Ansel found 14 photos — 6 need enhancement" },
      { at: 52, message: "Ansel placing hero exterior shot..." },
      { at: 78, message: "Ansel optimizing gallery images for mobile..." },
      { at: 97, message: "Ansel photo placement complete ✅" },
    ],
    spielberg: [
      { at: 0, message: "Spielberg locating video assets on site..." },
      { at: 24, message: "Spielberg found 2 background videos to optimize" },
      { at: 50, message: "Spielberg compressing hero loop for fast load..." },
      { at: 78, message: "Spielberg placing testimonial reel in About section..." },
      { at: 97, message: "Spielberg video optimization complete ✅" },
    ],
    rex: [
      { at: 0, message: "Rex running quality checks on all agent output..." },
      { at: 30, message: "Rex validating design consistency across pages..." },
      { at: 62, message: "Rex checking mobile breakpoints and tap targets..." },
      { at: 92, message: "Rex passed all quality checks — score 94/100 ✅" },
    ],
    publisher: [
      { at: 0, message: "Publisher packaging CSS for live deployment..." },
      { at: 22, message: "Publisher generating rollback-safe stylesheet..." },
      { at: 48, message: "Publisher wiring new layout to existing WordPress..." },
      { at: 74, message: "Publisher preparing live preview bundle..." },
      { at: 96, message: "Publisher ready — your redesign is staged ✅" },
    ],
  };
}

export function generateMockAnalysisResult(url: string): AnalysisResult {
  const domain = displayUrl(url);
  const biz = inferBusiness(domain);

  return {
    url,
    completedAt: new Date().toISOString(),
    scout: {
      url,
      screenshot: "",
      html: "",
      css: "",
      hasSsl: true,
      hasMetaDescription: false,
      hasMetaViewport: false,
      hasH1: true,
      imagesWithoutAlt: 9,
      brokenLinks: 2,
      phoneVisible: true,
      addressVisible: false,
      hasGoogleAnalytics: false,
      hasSchemaMarkup: false,
      copyrightYearCurrent: false,
      pageLoadTimeMs: 4200,
      title: `${domain.split(".")[0]} — Welcome`,
      h1Text: `Welcome to ${domain.split(".")[0]}`,
      metaDescription: "",
      brandColors: ["#2563eb", "#ffffff", "#1f2937"],
      textContent:
        "Welcome to our website. We have been serving the community for over 20 years. Click here to learn more about our services. Contact us today!",
    },
    einstein: {
      businessType: biz.type,
      subCategory: biz.sub,
      personality: biz.personality,
      pricePoint: "mid",
      targetAudience: biz.audience,
      location: "Local market",
      summary: `${domain} presents as a ${biz.sub.toLowerCase()} with strong offline reputation but a dated online presence that likely costs conversions daily.`,
    },
    critic: {
      overallDesign: 3,
      colors: 4,
      typography: 2,
      layout: 3,
      mobileReadiness: 2,
      problems: [
        {
          issue: "Homepage hero lacks a clear value proposition",
          evidence: "Generic headline with no differentiation or local trust signals",
        },
        {
          issue: "Typography hierarchy is weak across all pages",
          evidence: "Multiple heading sizes compete; body text is hard to scan on mobile",
        },
        {
          issue: "Mobile layout breaks on smaller screens",
          evidence: "Navigation overlaps content; buttons are below recommended tap size",
        },
        {
          issue: "Color palette feels dated and low-contrast",
          evidence: "Bright blue buttons on gray backgrounds reduce readability",
        },
        {
          issue: "Calls-to-action are buried below the fold",
          evidence: "Primary CTA appears only after three screen scrolls on mobile",
        },
        {
          issue: "Image quality inconsistent — hurts credibility",
          evidence: "Mix of pixelated stock photos and unoptimized uploads",
        },
      ],
    },
    seoGuy: {
      score: 4,
      issues: [
        { issue: "Missing meta descriptions on key landing pages", severity: "high" },
        { issue: "No structured data (schema) detected", severity: "high" },
        { issue: "Images missing alt text — 9 found", severity: "medium" },
        { issue: "Page title tags are generic and duplicated", severity: "medium" },
        { issue: "Slow mobile load time hurting rankings", severity: "high" },
      ],
      metaTags: {
        title: `${domain} — Home`,
        description: null,
        viewport: null,
        robots: "index, follow",
      },
      headingStructure: ["H1: Welcome", "H2: Our Services", "H2: Contact Us"],
      recommendations: [
        "Add unique meta descriptions to all indexable pages",
        "Implement LocalBusiness schema markup",
        "Compress images and enable lazy loading",
        "Rewrite title tags with location + service keywords",
      ],
    },
    writer: {
      heroHeadline: `The ${biz.type} ${domain.split(".")[0]} Trusts — Now Online`,
      heroSubheadline:
        "Modern design, clear messaging, and mobile-first layout built to turn visitors into customers.",
      ctaText: "Book Your Visit Today",
      aboutSection:
        "For over two decades we've served our community with care and consistency. Your new site tells that story clearly — with proof, photos, and a path to action on every page.",
    },
    picasso: {
      primaryColor: "#C9A84C",
      secondaryColor: "#0D1117",
      accentColor: "#e8c96a",
      backgroundColor: "#0D1117",
      textColor: "#f5f5f5",
      headingFont: "system-ui, sans-serif",
      bodyFont: "system-ui, sans-serif",
      borderRadius: "16px",
      animationStyle: "subtle fade-up on scroll",
      layoutStructure: "hero → trust bar → services → gallery → testimonials → CTA",
      sectionOrder: ["hero", "trust", "services", "gallery", "testimonials", "contact"],
      heroStyle: "full-bleed image with glass overlay card",
      uniquenessSeed: `${domain}-${Date.now()}`,
    },
    ansel: {
      placements: [
        {
          filename: "exterior-hero.jpg",
          description: "Storefront exterior at golden hour",
          placement: "hero",
          confidence: 0.94,
        },
        {
          filename: "team-about.jpg",
          description: "Staff team photo",
          placement: "about",
          confidence: 0.91,
        },
        {
          filename: "service-1.jpg",
          description: "Primary service in action",
          placement: "services",
          confidence: 0.88,
        },
      ],
    },
    spielberg: {
      videos: [
        {
          filename: "hero-loop.mp4",
          contentType: "ambient background",
          placement: "Hero background loop",
          trimStart: 0,
          trimEnd: 12,
          notes: "Muted autoplay loop, optimized for mobile",
        },
        {
          filename: "testimonial-reel.mp4",
          contentType: "customer stories",
          placement: "Testimonials section",
          notes: "Lazy-loaded with poster frame",
        },
      ],
    },
    rex: {
      passed: true,
      score: 94,
      issues: [],
      recommendations: [
        "Consider adding a FAQ section for SEO",
        "Schedule monthly photo refresh via dashboard",
      ],
    },
    publisher: {
      css: "/* RUB generated stylesheet — mock UI mode */",
    },
    scores: {
      overall: 38,
      design: 3,
      mobile: 2,
      speed: 4,
      seo: 5,
      content: 4,
      image: 3,
    },
    improvedScores: {
      design: 9,
      mobile: 10,
      speed: 9,
      seo: 8,
    },
    revenueEstimate: {
      customersLostPerMonth: 47,
      revenueLostPerMonth: 2350,
      disclaimer:
        "Estimate based on industry benchmarks for sites with similar design, speed, and SEO scores. Actual results vary.",
    },
  };
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
