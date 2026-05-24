export type AgentName =
  | "scout"
  | "einstein"
  | "critic"
  | "seoGuy"
  | "writer"
  | "picasso"
  | "ansel"
  | "spielberg"
  | "rex"
  | "publisher";

export type AgentStatus = "waiting" | "working" | "done" | "error";

export interface ScoutResult {
  url: string;
  screenshot: string;
  html: string;
  css: string;
  hasSsl: boolean;
  hasMetaDescription: boolean;
  hasMetaViewport: boolean;
  hasH1: boolean;
  imagesWithoutAlt: number;
  brokenLinks: number;
  phoneVisible: boolean;
  addressVisible: boolean;
  hasGoogleAnalytics: boolean;
  hasSchemaMarkup: boolean;
  copyrightYearCurrent: boolean;
  pageLoadTimeMs: number;
  title: string;
  h1Text: string;
  metaDescription: string;
  brandColors: string[];
  textContent: string;
}

export interface BusinessProfile {
  businessType: string;
  subCategory: string;
  personality: "formal" | "casual" | "mixed";
  pricePoint: "budget" | "mid" | "premium" | "unknown";
  targetAudience: string;
  location: string;
  summary: string;
}

export interface CriticResult {
  overallDesign: number;
  colors: number;
  typography: number;
  layout: number;
  mobileReadiness: number;
  problems: { issue: string; evidence: string }[];
}

export interface SeoResult {
  score: number;
  issues: { issue: string; severity: "high" | "medium" | "low" }[];
  metaTags: Record<string, string | null>;
  headingStructure: string[];
  recommendations: string[];
}

export interface WriterResult {
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  aboutSection: string;
}

export interface DesignSystem {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  animationStyle: string;
  layoutStructure: string;
  sectionOrder: string[];
  heroStyle: string;
  uniquenessSeed: string;
}

export interface PhotoPlacement {
  filename: string;
  description: string;
  placement:
    | "hero"
    | "about"
    | "services"
    | "gallery"
    | "testimonials";
  confidence: number;
}

export interface VideoPlan {
  filename: string;
  contentType: string;
  placement: string;
  trimStart?: number;
  trimEnd?: number;
  notes: string;
}

export interface RexResult {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface PublisherResult {
  css: string;
}

export interface RevenueEstimate {
  customersLostPerMonth: number;
  revenueLostPerMonth: number;
  disclaimer: string;
}

export interface AnalysisResult {
  url: string;
  completedAt: string;
  scout: ScoutResult;
  einstein: BusinessProfile;
  critic: CriticResult;
  seoGuy: SeoResult;
  writer: WriterResult;
  picasso: DesignSystem;
  ansel: { placements: PhotoPlacement[] };
  spielberg: { videos: VideoPlan[] };
  rex: RexResult;
  publisher: PublisherResult;
  scores: {
    overall: number;
    design: number;
    mobile: number;
    speed: number;
    seo: number;
    content: number;
    image: number;
  };
  improvedScores: {
    design: number;
    mobile: number;
    speed: number;
    seo: number;
  };
  revenueEstimate: RevenueEstimate;
}

export interface AutopsyResult {
  url: string;
  completedAt: string;
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  scout: ScoutResult;
  analysis: string;
  scores: AnalysisResult["scores"];
  revenueEstimate: RevenueEstimate;
  honestSummary: string;
}

export type SSEEvent =
  | { type: "agent_start"; agent: AgentName; message: string }
  | { type: "agent_progress"; agent: AgentName; progress: number }
  | { type: "agent_complete"; agent: AgentName; message: string }
  | { type: "agent_error"; agent: AgentName; message: string }
  | { type: "complete"; result: AnalysisResult }
  | { type: "error"; message: string };

export interface AnalyzeRequest {
  url: string;
  photos?: { name: string; base64: string; mimeType: string }[];
  videos?: { name: string; size: number; mimeType: string; duration?: number }[];
}
