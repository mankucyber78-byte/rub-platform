"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, PageTransition, EASE } from "@/components/rub-premium";
import { displayUrl, normalizeUrl, setStoredUrl } from "@/lib/rub-storage";
import {
  AUTOPSY_LOADING_STEPS,
  generateMockAutopsyReport,
  sleep,
  type MockAutopsyReport,
} from "@/lib/mock-autopsy";

const BG = "#080B10";
const CARD = "#0D1117";
const GOLD = "#C9A84C";

const TRUST_BADGES = [
  "🔍 Real Google Lighthouse data",
  "📊 Honest results only",
  "🔒 No signup required",
  "⚡ Results in 60 seconds",
];

const WHAT_YOU_GET = [
  {
    emoji: "⚡",
    title: "Speed Score",
    description:
      "How fast your site loads and how many visitors leave because it is too slow",
  },
  {
    emoji: "📱",
    title: "Mobile Score",
    description:
      "How your site looks on phones where 70% of your customers are searching",
  },
  {
    emoji: "🔍",
    title: "SEO Score",
    description:
      "Why Google is hiding your site from potential customers searching for you",
  },
  {
    emoji: "💰",
    title: "Revenue Impact",
    description:
      "Exactly how much money your poor website is costing you every single month",
  },
];

const DEMO_SCORES = [
  { label: "Design", score: "3/10", status: "❌" },
  { label: "Mobile", score: "2/10", status: "❌" },
  { label: "Speed", score: "4/10", status: "❌" },
  { label: "SEO", score: "5/10", status: "⚠️" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Enter your URL", desc: "Paste your website address in the box above" },
  { step: "2", title: "Wait 60 seconds", desc: "Our engine runs a full Lighthouse-style scan" },
  { step: "3", title: "Get your honest report", desc: "See scores, problems, and revenue impact" },
];

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = score <= 40 ? "#EF4444" : score <= 70 ? "#F97316" : GOLD;

  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </svg>
      <div className="text-center">
        <p className="rub-font-display text-4xl font-bold" style={{ color }}>
          {score}
        </p>
        <p className="text-sm text-white/40">/100</p>
      </div>
    </div>
  );
}

function BlurredRevenue() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
      <p className="text-sm text-white/60">Estimated revenue lost</p>
      <p className="mt-2 rub-font-display text-3xl font-bold text-white/90 blur-md select-none sm:text-4xl">
        You are losing $█,███ per month
      </p>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080B10]/60 backdrop-blur-[2px]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-xl">
          🔒
        </span>
        <p className="mt-3 text-sm font-medium text-[#C9A84C]">Unlock to see exact amount</p>
      </div>
    </div>
  );
}

function LoadingSteps({ activeStep }: { activeStep: number }) {
  return (
    <div className="mx-auto max-w-md space-y-3">
      {AUTOPSY_LOADING_STEPS.map((step, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
              active ? "border border-[#C9A84C]/30 bg-[#C9A84C]/5" : ""
            }`}
          >
            <span className="text-lg">{done ? "✅" : step.icon}</span>
            <span
              className={`text-sm ${
                done ? "text-emerald-400" : active ? "text-white" : "text-white/35"
              }`}
            >
              {step.label}
            </span>
            {active && !done && (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="ml-auto text-xs text-[#C9A84C]"
              >
                ...
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function FreeTierResults({ report }: { report: MockAutopsyReport }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="rounded-2xl border border-white/[0.06] p-6 text-center sm:p-8" style={{ backgroundColor: CARD }}>
        <p className="text-xs tracking-widest text-white/40 uppercase">Overall website score</p>
        <ScoreRing score={report.overallScore} />
        {report.overallScore < 50 && (
          <span className="mt-2 inline-block rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 uppercase">
            Critical
          </span>
        )}
        <p className="mt-4 text-sm text-white/50">{report.honestSummary}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] p-6 sm:p-8" style={{ backgroundColor: CARD }}>
        <h3 className="rub-font-display text-xl font-bold text-white">Top 3 Problems Found</h3>
        <ul className="mt-5 space-y-4">
          {report.problems.slice(0, 3).map((p, i) => (
            <li key={p.issue} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xs font-bold text-red-400">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{p.issue}</p>
                <p className="mt-1 text-xs text-white/40">{p.evidence}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <BlurredRevenue />
    </motion.div>
  );
}

function PaidTierPreview({ onUnlock }: { onUnlock: () => void }) {
  const blurredBlocks = [
    "All 6 category scores",
    "15 technical checks",
    "5 problems with evidence",
    "Exact revenue calculation",
    "PDF download + share link",
  ];

  return (
    <div className="mt-10 rounded-2xl border border-[#C9A84C]/30 p-6 sm:p-8" style={{ backgroundColor: CARD }}>
      <h3 className="rub-font-display text-center text-xl font-bold text-white sm:text-2xl">
        Full Autopsy Report
      </h3>
      <div className="mt-6 space-y-3">
        {blurredBlocks.map((label) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-lg border border-white/[0.06] px-4 py-3"
          >
            <p className="blur-sm select-none text-sm text-white/60">{label}</p>
            <div className="absolute inset-0 bg-[#080B10]/50" />
          </div>
        ))}
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onUnlock}
        className="rub-btn-gold rub-btn-shimmer relative mt-8 w-full rounded-xl px-6 py-4 text-base font-bold sm:text-lg"
      >
        Unlock Full Report — $9.99
      </motion.button>
      <p className="mt-4 text-center text-sm text-white/45">
        Or{" "}
        <Link href="/" className="font-semibold text-[#C9A84C] hover:underline">
          fix everything now — $49.99
        </Link>
      </p>
    </div>
  );
}

function FullPaidReport({ report }: { report: MockAutopsyReport }) {
  const handlePdf = () => {
    window.alert("PDF report downloaded! (Demo mode)");
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(report.shareUrl);
      window.alert("Share link copied to clipboard!");
    } catch {
      window.prompt("Copy your share link:", report.shareUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 space-y-8"
    >
      <div className="rounded-2xl border border-[#C9A84C]/35 p-6 sm:p-8" style={{ backgroundColor: CARD }}>
        <p className="text-center text-sm font-medium text-emerald-400">Full report unlocked ✓</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(report.scores).map(([key, val]) => (
            <div key={key} className="rounded-lg border border-white/[0.06] p-3 text-center">
              <p className="text-[10px] tracking-wide text-white/40 uppercase">{key}</p>
              <p className="mt-1 text-xl font-bold text-[#C9A84C]">{val}/10</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="font-semibold text-white">15 Technical Checks</h4>
          <ul className="mt-4 space-y-2">
            {report.technicalChecks.map((check) => (
              <li
                key={check.label}
                className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.04] px-3 py-2 text-sm"
              >
                <span className="text-white/80">
                  {check.passed ? "✅" : "❌"} {check.label}
                </span>
                <span className="shrink-0 text-xs text-white/35">{check.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h4 className="font-semibold text-white">All 5 Problems — With Evidence</h4>
          <ul className="mt-4 space-y-4">
            {report.problems.map((p, i) => (
              <li key={p.issue} className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
                <p className="text-sm font-medium text-white">
                  {i + 1}. {p.issue}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/45">
                  Evidence: {p.evidence}
                </p>
                <span
                  className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.severity === "high"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {p.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-red-500/25 bg-red-500/5 p-5">
          <p className="text-sm text-white/60">Exact revenue impact</p>
          <p className="rub-font-display mt-2 text-4xl font-bold text-red-400">
            ${report.revenueLostPerMonth.toLocaleString()}
            <span className="text-base font-normal text-white/40"> /month</span>
          </p>
          <p className="mt-2 text-sm text-red-400/80">
            ${report.dailyLoss}/day · ~{report.customersLostPerMonth} customers lost
          </p>
          <p className="mt-3 text-xs text-white/35">{report.revenueFormula}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handlePdf}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            📄 Download PDF Report
          </button>
          <button
            type="button"
            onClick={copyShare}
            className="flex-1 rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-3 text-sm font-semibold text-[#C9A84C] hover:bg-[#C9A84C]/15"
          >
            🔗 Copy Shareable URL
          </button>
        </div>
        <p className="mt-3 truncate text-center text-[10px] text-white/30">{report.shareUrl}</p>
      </div>

      <div className="rounded-2xl border border-[#C9A84C]/25 p-6 text-center" style={{ backgroundColor: CARD }}>
        <p className="rub-font-display text-lg font-bold text-white">Ready to fix everything?</p>
        <p className="mt-2 text-sm text-white/45">Full AI redesign, published live — one time $49.99</p>
        <Link
          href="/"
          onClick={() => setStoredUrl(report.url)}
          className="rub-btn-gold rub-btn-shimmer relative mt-5 inline-block w-full rounded-xl px-6 py-4 text-base font-bold sm:w-auto sm:min-w-[280px]"
        >
          Fix Everything — $49.99
        </Link>
      </div>
    </motion.div>
  );
}

function DemoReportPreview({ onScrollToInput }: { onScrollToInput: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#080B10]/20 to-[#080B10]/40" />

      <div className="relative space-y-6">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div>
            <p className="text-xs tracking-widest text-white/40 uppercase">Overall Score</p>
            <p className="rub-font-display mt-1 text-4xl font-bold text-red-400">
              34<span className="text-lg text-white/40">/100</span>
            </p>
          </div>
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-bold text-red-400 uppercase">
            Critical
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DEMO_SCORES.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-[#0D1117]/80 px-3 py-4 text-center"
            >
              <p className="text-xs text-white/40">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-white">{item.score}</p>
              <p className="mt-1 text-sm">{item.status}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <p className="text-sm text-white/50">Revenue damage</p>
          <p className="rub-font-display mt-2 text-2xl font-bold text-red-400 sm:text-3xl">
            Estimated loss: $2,350/month
          </p>
          <p className="mt-1 text-sm text-red-400/70">Cost per day: $78</p>
        </div>
      </div>

      <div className="relative mt-8 flex flex-col items-center gap-3">
        <motion.button
          type="button"
          onClick={onScrollToInput}
          whileHover={{ y: -2 }}
          className="text-sm font-semibold text-[#C9A84C] hover:underline sm:text-base"
        >
          Get your real report free →
        </motion.button>
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl text-[#C9A84C]"
          aria-hidden
        >
          ↑
        </motion.span>
      </div>
    </div>
  );
}

export default function AutopsyPage() {
  const heroRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "results">("input");
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<MockAutopsyReport | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  const scrollToInput = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => inputRef.current?.focus(), 500);
  };

  const runAutopsy = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Please enter a valid website URL.");
      scrollToInput();
      return;
    }
    setError("");
    setUnlocked(false);
    setPhase("loading");
    setLoadingStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });

    for (let i = 0; i < AUTOPSY_LOADING_STEPS.length; i++) {
      setLoadingStep(i);
      await sleep(i === AUTOPSY_LOADING_STEPS.length - 1 ? 800 : 1200);
    }

    setReport(generateMockAutopsyReport(normalized));
    setPhase("results");
  };

  const resetAutopsy = () => {
    setPhase("input");
    setReport(null);
    setUnlocked(false);
    setError("");
    scrollToInput();
  };

  return (
    <PageTransition>
      <div className="min-h-screen text-white" style={{ backgroundColor: BG }}>
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 55%)",
          }}
        />

        {/* SECTION 1 — Hero */}
        <section
          ref={heroRef}
          id="autopsy-hero"
          className="relative border-b border-white/[0.06] px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="mx-auto max-w-3xl">
            <Link href="/" className="rub-font-display text-xl font-bold text-[#C9A84C] sm:text-2xl">
              RUB
            </Link>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-10 text-center"
            >
              <span className="text-6xl sm:text-7xl" aria-hidden>
                💀
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mt-6 text-center"
            >
              <h1 className="rub-font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Free Website Autopsy
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
                Find out exactly why your website is losing customers and how much it costs you
                every month
              </p>
              <p className="mt-3 text-sm text-white/35">
                Takes 60 seconds. No signup. No credit card. Free.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
              className="mt-10"
            >
              <input
                ref={inputRef}
                id="autopsy-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && phase !== "loading" && runAutopsy()}
                disabled={phase === "loading"}
                placeholder="Enter your website URL..."
                className="rub-input w-full rounded-xl border border-[rgba(201,168,76,0.4)] bg-[#0D1117]/80 px-5 py-4 text-base text-white placeholder:text-white/30 transition-colors focus:border-[#C9A84C] focus:outline-none disabled:opacity-60"
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

              {phase === "results" && report ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={runAutopsy}
                    className="rub-btn-gold rub-btn-shimmer relative flex-1 rounded-xl px-6 py-4 text-base font-bold sm:text-lg"
                  >
                    Diagnose Again — Free
                  </motion.button>
                  <button
                    type="button"
                    onClick={resetAutopsy}
                    className="rounded-xl border border-white/15 px-6 py-4 text-sm font-medium text-white/60 hover:border-white/25 hover:text-white"
                  >
                    Start over
                  </button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={runAutopsy}
                  disabled={phase === "loading"}
                  className="rub-btn-gold rub-btn-shimmer relative mt-4 w-full rounded-xl px-6 py-4 text-base font-bold disabled:opacity-70 sm:text-lg"
                >
                  {phase === "loading" ? "Diagnosing..." : "Diagnose My Website — Free"}
                </motion.button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
            >
              {TRUST_BADGES.map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center text-xs text-white/50 sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.section
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
            >
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="rub-font-display text-2xl font-bold text-white sm:text-3xl">
                  Diagnosing {displayUrl(normalizeUrl(url)) || "your site"}...
                </h2>
                <p className="mt-2 text-sm text-white/40">This usually takes about 60 seconds</p>
                <div className="mt-10">
                  <LoadingSteps activeStep={loadingStep} />
                </div>
              </div>
            </motion.section>
          )}

          {phase === "results" && report && (
            <motion.section
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative border-b border-white/[0.06] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
            >
              <div className="mx-auto max-w-2xl">
                <p className="text-sm text-[#C9A84C]">Autopsy complete</p>
                <h2 className="rub-font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
                  {report.domain}
                </h2>

                <div className="mt-8">
                  <p className="mb-4 text-xs font-bold tracking-widest text-white/40 uppercase">
                    Free preview
                  </p>
                  <FreeTierResults report={report} />
                </div>

                {!unlocked ? (
                  <PaidTierPreview onUnlock={() => setUnlocked(true)} />
                ) : (
                  <FullPaidReport report={report} />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {phase === "input" && (
          <>
            {/* SECTION 2 — What You Get */}
            <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <div className="mx-auto max-w-6xl">
                <FadeUp className="mb-12 text-center">
                  <h2 className="rub-font-display text-3xl font-bold text-white sm:text-4xl">
                    What your free autopsy reveals
                  </h2>
                </FadeUp>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {WHAT_YOU_GET.map((item, i) => (
                    <FadeUp key={item.title} delay={i * 0.08}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex h-full min-h-[220px] flex-col rounded-2xl border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] p-6"
                      >
                        <span className="text-4xl" aria-hidden>
                          {item.emoji}
                        </span>
                        <h3 className="rub-font-display mt-4 text-lg font-semibold text-[#C9A84C]">
                          {item.title}
                        </h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">
                          {item.description}
                        </p>
                      </motion.div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3 — Sample Report Preview */}
            <section className="relative border-y border-white/[0.06] bg-[#0D1117]/40 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <FadeUp className="mb-10 text-center">
                  <h2 className="rub-font-display text-3xl font-bold text-white sm:text-4xl">
                    Here is what a real autopsy report looks like
                  </h2>
                  <p className="mt-3 text-sm text-white/40">Sample report — your results will be based on your actual site</p>
                </FadeUp>

                <FadeUp delay={0.1}>
                  <DemoReportPreview onScrollToInput={scrollToInput} />
                </FadeUp>
              </div>
            </section>

            {/* SECTION 4 — How It Works */}
            <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <FadeUp className="mb-12 text-center">
                  <h2 className="rub-font-display text-3xl font-bold text-white sm:text-4xl">
                    How it works
                  </h2>
                </FadeUp>

                <div className="grid gap-8 md:grid-cols-3">
                  {HOW_IT_WORKS.map((item, i) => (
                    <FadeUp key={item.step} delay={i * 0.1}>
                      <div className="text-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 rub-font-display text-lg font-bold text-[#C9A84C]">
                          {item.step}
                        </span>
                        <h3 className="rub-font-display mt-5 text-xl font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/50">{item.desc}</p>
                      </div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 5 — Viral / Share */}
            <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <FadeUp>
                  <div className="rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.05)] p-8 text-center sm:p-12">
                    <span className="text-4xl" aria-hidden>
                      📤
                    </span>
                    <h2 className="rub-font-display mt-5 text-2xl font-bold text-white sm:text-3xl">
                      Share your report
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/55">
                      Business owners share their autopsy reports to show their partners, accountants
                      and staff exactly why they need a new website
                    </p>
                    <motion.button
                      type="button"
                      onClick={scrollToInput}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="rub-btn-gold mt-8 rounded-xl px-8 py-4 text-base font-bold"
                    >
                      Get My Free Report →
                    </motion.button>
                  </div>
                </FadeUp>
              </div>
            </section>
          </>
        )}

        {/* Footer strip */}
        <footer className="relative border-t border-white/[0.06] px-4 py-8 text-center sm:px-6">
          <Link href="/" className="text-sm text-white/40 hover:text-[#C9A84C]">
            ← Back to RUB homepage
          </Link>
        </footer>
      </div>
    </PageTransition>
  );
}
