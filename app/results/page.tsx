"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { Spinner } from "@/components/rub-ui";
import {
  AnimatedNumber,
  EmptyState,
  GoldParticles,
  SkeletonPage,
} from "@/components/rub-premium";
import type { AnalysisResult } from "@/lib/agents/types";
import {
  buildHealthScores,
  buildScoreImprovements,
} from "@/lib/agents/build-health-report";
import {
  displayUrl,
  getStoredAnalysis,
  getStoredUrl,
} from "@/lib/rub-storage";

const BG = "#080B10";
const CARD = "#0D1117";
const GOLD = "#C9A84C";
const EASE = [0.22, 1, 0.36, 1] as const;

const PHOTO_LABELS = [
  "Hero photo",
  "Team photo",
  "Interior photo",
  "Product photo",
  "Service photo",
  "Gallery photo",
  "Logo photo",
  "Workspace photo",
  "Portrait photo",
  "Exterior photo",
];

const VIDEO_PLACEMENTS = [
  "Hero background loop",
  "About us section",
  "Services showcase",
  "Customer testimonials",
  "Contact page embed",
];

const SCORE_ICONS: Record<string, string> = {
  "Design Score": "🎨",
  "Mobile Score": "📱",
  "Speed Score": "⚡",
  "SEO Score": "📈",
  "Content Score": "✍️",
  "Image Score": "📸",
};

function scoreHex(value: number, max: number) {
  const pct = (value / max) * 100;
  if (pct <= 40) return "#EF4444";
  if (pct <= 70) return "#F97316";
  return GOLD;
}

function projectedOverall(analysis: AnalysisResult) {
  const { improvedScores, scores } = analysis;
  const projected =
    (improvedScores.design +
      improvedScores.mobile +
      improvedScores.speed +
      improvedScores.seo +
      Math.min(scores.content + 5, 10) +
      Math.min(scores.image + 6, 10)) /
    6;
  return Math.round(projected * 10);
}

function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CircularScoreRing({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = value / max;

  return (
    <svg className="h-36 w-36 -rotate-90 sm:h-40 sm:w-40" viewBox="0 0 120 120">
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="8"
      />
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
        whileInView={{ strokeDashoffset: c * (1 - pct) }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE }}
      />
    </svg>
  );
}

function OverallScoreCard({ score }: { score: number }) {
  const color = scoreHex(score, 100);
  const critical = score < 50;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 text-center sm:p-10"
      style={{ backgroundColor: CARD }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${color}22 0%, transparent 60%)`,
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <CircularScoreRing value={score} max={100} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ color }}>
              <AnimatedNumber
                value={score}
                className="rub-font-display text-5xl font-bold sm:text-6xl"
              />
            </span>
            <span className="text-sm text-white/40">/100</span>
          </div>
        </div>
        {critical && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1 text-xs font-bold tracking-widest text-red-400 uppercase"
          >
            Critical
          </motion.span>
        )}
        <p className="mt-4 max-w-sm text-sm text-white/50">
          Your site underperforms on design, mobile, and speed — costing you
          customers every day.
        </p>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  max,
  issue,
  delay,
}: {
  label: string;
  value: number;
  max: number;
  issue: string;
  delay: number;
}) {
  const color = scoreHex(value, max);
  const icon = SCORE_ICONS[label] ?? "📊";

  return (
    <FadeUp delay={delay}>
      <div
        className="rounded-xl border border-white/[0.06] p-4 sm:p-5"
        style={{ backgroundColor: CARD }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {icon}
            </span>
            <span className="text-sm font-medium text-white/80">{label.replace(" Score", "")}</span>
          </div>
          <span style={{ color }}>
            <AnimatedNumber
              value={value}
              suffix={`/${max}`}
              className="text-xl font-bold sm:text-2xl"
            />
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${(value / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay + 0.1, ease: EASE }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/40">{issue}</p>
      </div>
    </FadeUp>
  );
}

function RevenueDamageCard({ analysis }: { analysis: AnalysisResult }) {
  const monthly = analysis.revenueEstimate.revenueLostPerMonth;
  const daily = Math.round(monthly / 30);

  return (
    <FadeUp>
      <motion.div
        className="rub-pulse-attention relative overflow-hidden rounded-2xl border border-red-500/25 p-6 sm:p-10"
        style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, #0D1117 60%)" }}
      >
        <h3 className="rub-font-display text-xl font-semibold text-white sm:text-2xl">
          Your Website Is Costing You
        </h3>
        <p className="mt-4">
          <span className="rub-font-display text-5xl font-bold text-red-500 sm:text-6xl">
            ${monthly.toLocaleString()}
          </span>
          <span className="mt-1 block text-sm text-white/50">per month</span>
        </p>
        <p className="mt-4 text-sm text-red-400/90">
          Every day you wait costs{" "}
          <span className="font-semibold text-red-400">${daily}</span>
        </p>
        <p className="mt-6 text-[11px] leading-relaxed text-white/30">
          Estimate based on real technical scores and industry averages.{" "}
          {analysis.revenueEstimate.disclaimer}
        </p>
      </motion.div>
    </FadeUp>
  );
}

function OldWebsitePreview({ screenshot }: { screenshot?: string }) {
  if (screenshot) {
    return (
      <div className="relative h-full min-h-[280px] sm:min-h-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshot}
          alt="Current website"
          className="h-full w-full object-cover object-top saturate-[0.65]"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }
  return (
    <div
      className="relative h-full min-h-[280px] saturate-[0.55] sm:min-h-[400px]"
      style={{ backgroundColor: "#1a1f26" }}
    >
      <div className="flex h-full flex-col p-4 opacity-75">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="h-3 w-20 rounded bg-white/20" />
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-2 w-6 rounded bg-white/15" />
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-28 rounded bg-white/10" />
          <p className="text-xs text-white/40">Welcome!!! Click here!!!</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 rounded bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewWebsitePreview({ analysis }: { analysis: AnalysisResult }) {
  const { picasso, writer, einstein } = analysis;
  return (
    <div
      className="relative h-full min-h-[280px] sm:min-h-[400px]"
      style={{ backgroundColor: picasso.backgroundColor }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${picasso.accentColor}44 0%, transparent 70%)`,
        }}
      />
      <div className="relative flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: picasso.accentColor }}>
            {einstein.businessType}
          </span>
          <div className="flex gap-2 text-[10px] text-white/50">
            <span>Home</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
        </div>
        <h3 className="rub-font-display mt-6 text-xl text-white sm:text-2xl">
          {writer.heroHeadline}
        </h3>
        <p className="mt-2 max-w-xs text-xs text-white/60">{writer.heroSubheadline}</p>
        <button
          type="button"
          className="mt-4 w-fit rounded-lg px-4 py-2 text-xs font-bold"
          style={{ backgroundColor: picasso.accentColor, color: picasso.backgroundColor }}
        >
          {writer.ctaText}
        </button>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-lg border border-white/10 bg-white/5 p-2"
            >
              <div className="mb-1 h-8 rounded bg-white/10" />
              <div className="h-1 w-full rounded bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeforeAfterSlider({
  screenshot,
  analysis,
  beforeScore,
  afterScore,
}: {
  screenshot?: string;
  analysis: AnalysisResult;
  beforeScore: number;
  afterScore: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPosition((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current || !e.touches[0]) return;
      updatePosition(e.touches[0].clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePosition]);

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-white/[0.08] sm:aspect-[16/9]"
        onMouseDown={(e) => {
          dragging.current = true;
          updatePosition(e.clientX);
        }}
        onTouchStart={(e) => {
          dragging.current = true;
          if (e.touches[0]) updatePosition(e.touches[0].clientX);
        }}
      >
        <div className="absolute inset-0">
          <NewWebsitePreview analysis={analysis} />
        </div>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <OldWebsitePreview screenshot={screenshot} />
        </div>
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-[#C9A84C] shadow-[0_0_16px_rgba(201,168,76,0.7)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#C9A84C] bg-[#080B10] shadow-xl">
            <span className="text-[10px] font-bold text-[#C9A84C]">◀ ▶</span>
          </div>
        </div>
        <span className="pointer-events-none absolute top-3 left-3 rounded bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/80 uppercase">
          Before
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded bg-[#C9A84C]/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#C9A84C] uppercase">
          After
        </span>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold text-white">
          {beforeScore}/100
        </span>
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-[#C9A84C] px-2.5 py-1 text-[10px] font-bold text-[#080B10]">
          {afterScore}/100
        </span>
      </div>
    </div>
  );
}

function UploadZone({
  icon,
  label,
  hint,
  accept,
  onFiles,
  disabled,
}: {
  icon: "photo" | "video";
  label: string;
  hint: string;
  accept: string;
  onFiles: (files: FileList) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled && e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
        disabled
          ? "cursor-not-allowed border-white/10 opacity-50"
          : dragOver
            ? "border-[#C9A84C] bg-[#C9A84C]/10"
            : "border-[#C9A84C]/40 bg-transparent hover:border-[#C9A84C] hover:bg-[#C9A84C]/5"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <span className="text-4xl text-[#C9A84C]/80" aria-hidden>
        {icon === "photo" ? "📷" : "🎬"}
      </span>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );
}

type UploadedPhoto = { id: string; url: string; name: string; label: string };
type UploadedVideo = { id: string; url: string; name: string; placement: string };

function ResultsContent() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("yourwebsite.com");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const uploadSectionRef = useRef<HTMLElement>(null);
  const paymentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = getStoredAnalysis<AnalysisResult>();
    if (stored) {
      setAnalysis(stored);
      setWebsiteUrl(displayUrl(stored.url));
    } else {
      setWebsiteUrl(displayUrl(getStoredUrl()));
    }
    setLoading(false);
  }, []);

  const healthScores = analysis ? buildHealthScores(analysis) : [];
  const overallScore = healthScores.find((s) => s.label === "Overall Score");
  const detailScores = healthScores.filter((s) => s.label !== "Overall Score");
  const scoreImprovements = analysis ? buildScoreImprovements(analysis) : [];
  const afterOverall = analysis ? projectedOverall(analysis) : 91;

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/payment");
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPayment = () => {
    paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePhotos = (files: FileList) => {
    const remaining = 10 - photos.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);
    setPhotos((prev) => [
      ...prev,
      ...toAdd.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        name: file.name,
        label: PHOTO_LABELS[(prev.length + i) % PHOTO_LABELS.length],
      })),
    ]);
  };

  const handleVideos = (files: FileList) => {
    const remaining = 5 - videos.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files)
      .filter((f) => f.type.startsWith("video/"))
      .slice(0, remaining);
    setVideos((prev) => [
      ...prev,
      ...toAdd.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        name: file.name,
        placement: VIDEO_PLACEMENTS[(prev.length + i) % VIDEO_PLACEMENTS.length],
      })),
    ]);
  };

  if (loading) return <SkeletonPage />;

  if (!analysis) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: BG }}
      >
        <EmptyState
          icon="📊"
          title="No analysis yet"
          description="Run an analysis from the homepage to see your website health report."
          action={
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rub-btn-gold rounded-xl px-6 py-3 text-sm"
            >
              Analyze My Website
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white" style={{ backgroundColor: BG }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <GoldParticles />
        <div className="rub-radial-glow absolute inset-0" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080B10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <a href="/" className="shrink-0 text-lg font-bold text-[#C9A84C]">
            RUB
          </a>
          <span className="truncate text-xs text-white/45 sm:text-sm">{websiteUrl}</span>
          <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400 sm:text-xs">
            Analysis Complete ✅
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-20">
        {/* SECTION 1 — HEALTH REPORT */}
        <FadeUp>
          <h1 className="rub-font-display text-3xl font-bold text-white sm:text-4xl">
            Website Health Report
          </h1>
          <p className="mt-2 text-sm text-white/45">Before RUB Redesign</p>
        </FadeUp>

        {overallScore && (
          <FadeUp className="mt-8">
            <OverallScoreCard score={overallScore.value} />
          </FadeUp>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {detailScores.map((score, i) => (
            <ScoreCard
              key={score.label}
              label={score.label}
              value={score.value}
              max={score.max}
              issue={score.issue}
              delay={i * 0.06}
            />
          ))}
        </div>

        <div className="mt-8">
          <RevenueDamageCard analysis={analysis} />
        </div>

        {/* SECTION 2 — UPLOAD */}
        <section ref={uploadSectionRef} className="mt-20 border-t border-white/[0.06] pt-16">
          <FadeUp>
            <h2 className="rub-font-display text-2xl font-bold text-white sm:text-3xl">
              Add Your Business Content
            </h2>
            <p className="mt-2 text-sm text-white/45">
              Our AI will enhance and place everything perfectly
            </p>
          </FadeUp>

          <FadeUp className="mt-8">
            <UploadZone
              icon="photo"
              label="Upload up to 10 photos"
              hint="Drag and drop or click to browse — JPG, PNG, WEBP"
              accept="image/*"
              onFiles={handlePhotos}
              disabled={photos.length >= 10}
            />
          </FadeUp>

          {photos.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group overflow-hidden rounded-xl border border-white/[0.06]"
                  style={{ backgroundColor: CARD }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="border-t border-white/[0.06] p-2">
                    <p className="text-[10px] font-medium text-[#C9A84C] sm:text-xs">
                      {photo.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <FadeUp className="mt-8">
            <UploadZone
              icon="video"
              label="Upload up to 5 short videos"
              hint="Drag and drop or click — MP4, MOV, WEBM"
              accept="video/*"
              onFiles={handleVideos}
              disabled={videos.length >= 5}
            />
          </FadeUp>

          {videos.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="overflow-hidden rounded-xl border border-white/[0.06]"
                  style={{ backgroundColor: CARD }}
                >
                  <div className="relative aspect-video bg-black/50">
                    <video
                      src={video.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#C9A84C]">→ {video.placement}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3 — BEFORE / AFTER */}
        <section className="mt-20 border-t border-white/[0.06] pt-16">
          <FadeUp>
            <h2 className="rub-font-display text-2xl font-bold text-white sm:text-3xl">
              Before &amp; After
            </h2>
            <p className="mt-2 text-sm text-white/45">
              Drag the gold handle to compare your old site with the new RUB design
            </p>
          </FadeUp>

          <FadeUp className="mt-8">
            <BeforeAfterSlider
              screenshot={analysis.scout.screenshot}
              analysis={analysis}
              beforeScore={analysis.scores.overall}
              afterScore={afterOverall}
            />
          </FadeUp>

          <FadeUp className="mt-6">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {scoreImprovements.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/5 px-3 py-2 text-xs sm:text-sm"
                >
                  <span className="text-white/50">{item.label}</span>
                  <span className="font-bold text-red-400">{item.before}</span>
                  <span className="text-[#C9A84C]">→</span>
                  <span className="font-bold text-[#C9A84C]">{item.after}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* WHAT HAPPENS NEXT */}
        <section className="mt-20 border-t border-white/[0.06] pt-16">
          <FadeUp>
            <h2 className="rub-font-display text-center text-2xl font-bold text-white sm:text-3xl">
              What Happens Next?
            </h2>
          </FadeUp>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FadeUp delay={0.05}>
              <div
                className="flex h-full flex-col rounded-xl border border-white/[0.06] p-5 sm:p-6"
                style={{ backgroundColor: CARD }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C]/15 text-sm font-bold text-[#C9A84C]">
                  1
                </span>
                <h3 className="mt-4 font-semibold text-white">Upload your photos and videos</h3>
                <p className="mt-2 flex-1 text-sm text-white/45">
                  Add up to 10 photos and 5 videos — AI enhances and places them.
                </p>
                <button
                  type="button"
                  onClick={scrollToUpload}
                  className="mt-4 text-left text-sm font-semibold text-[#C9A84C] hover:underline"
                >
                  Upload Now →
                </button>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div
                className="flex h-full flex-col rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
                  2
                </span>
                <h3 className="mt-4 font-semibold text-white">Review your new design</h3>
                <p className="mt-2 flex-1 text-sm text-emerald-400/80">Already done ✅</p>
                <p className="mt-4 text-sm text-white/45">
                  Use the slider above to compare before and after.
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div
                className="flex h-full flex-col rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-5 sm:p-6"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C]/20 text-sm font-bold text-[#C9A84C]">
                  3
                </span>
                <h3 className="mt-4 font-semibold text-white">Publish for $49.99</h3>
                <p className="mt-2 flex-1 text-sm text-white/45">
                  One-time payment. Go live in under 60 seconds.
                </p>
                <button
                  type="button"
                  onClick={scrollToPayment}
                  className="mt-4 text-left text-sm font-semibold text-[#C9A84C] hover:underline"
                >
                  Publish My Website →
                </button>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 4 — PAYMENT */}
        <section ref={paymentRef} className="mt-20 border-t border-white/[0.06] pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, ease: EASE }}
            className="mx-auto w-full max-w-2xl rounded-2xl border-2 border-[#C9A84C]/45 p-8 text-center shadow-[0_0_60px_rgba(201,168,76,0.12)] sm:p-12"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(13,17,23,0.98) 50%)",
            }}
          >
            <h2 className="rub-font-display text-3xl font-bold text-white sm:text-4xl">
              Your new website is ready!
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/55 sm:text-base">
              Love what you see? Go live in under 2 minutes
            </p>

            <div className="mx-auto mt-10 max-w-lg rounded-xl border border-white/[0.08] bg-black/20 px-6 py-8">
              <p className="text-xs tracking-widest text-white/40 uppercase">Score improvement</p>
              <p className="rub-font-display mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-5xl font-bold sm:text-6xl">
                <span className="text-red-400">{analysis.scores.overall}</span>
                <span className="text-3xl text-white/25 sm:text-4xl">/100</span>
                <span className="text-3xl text-white/30 sm:text-4xl">→</span>
                <span className="text-[#C9A84C]">{afterOverall}</span>
                <span className="text-3xl text-white/25 sm:text-4xl">/100</span>
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              disabled={publishing}
              className="rub-btn-gold rub-btn-shimmer relative mt-10 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-5 text-lg font-bold sm:text-xl"
            >
              {publishing && <Spinner />}
              🚀 Publish My New Website — $49.99
            </motion.button>

            <p className="mt-5 text-xs leading-relaxed text-white/45 sm:text-sm">
              30 day money back guarantee • Switch back anytime • Backend never touched
            </p>

            <p className="mx-auto mt-6 max-w-md rounded-xl border border-[#C9A84C]/15 bg-[#C9A84C]/5 px-4 py-3 text-xs leading-relaxed text-white/55 sm:text-sm">
              ❤️ 7% goes to old age homes, orphanages and children&apos;s education
            </p>
          </motion.div>
        </section>
      </main>

      {/* Sticky mobile publish bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#C9A84C]/30 bg-[#C9A84C] px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#080B10]">Your redesign is ready →</p>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="shrink-0 rounded-lg bg-[#080B10] px-4 py-2.5 text-sm font-bold text-[#C9A84C]"
          >
            {publishing ? "..." : "Publish — $49.99"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsFallback() {
  return (
    <div style={{ backgroundColor: BG }}>
      <SkeletonPage />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsContent />
    </Suspense>
  );
}
