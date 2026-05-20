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
import { FriendlyError, Spinner } from "@/components/rub-ui";
import { displayUrl, getStoredUrl } from "@/lib/rub-storage";

const DARK = "#0D1117";
const GOLD = "#C9A84C";

type ScoreColor = "red" | "orange" | "green";

const HEALTH_SCORES: {
  label: string;
  value: number;
  max: number;
  color: ScoreColor;
  issue: string;
}[] = [
  {
    label: "Overall Score",
    value: 34,
    max: 100,
    color: "red",
    issue: "Site underperforms on every major metric — urgent redesign recommended.",
  },
  {
    label: "Design Score",
    value: 3,
    max: 10,
    color: "red",
    issue: "Outdated layout, poor typography, no visual hierarchy or brand consistency.",
  },
  {
    label: "Mobile Score",
    value: 2,
    max: 10,
    color: "red",
    issue: "Not mobile-friendly — text too small, buttons hard to tap, horizontal scrolling.",
  },
  {
    label: "Speed Score",
    value: 4,
    max: 10,
    color: "orange",
    issue: "Large unoptimized images slow load time — visitors leave before page loads.",
  },
  {
    label: "SEO Score",
    value: 5,
    max: 10,
    color: "orange",
    issue: "Missing meta descriptions, weak headings, no local SEO structure.",
  },
  {
    label: "Content Score",
    value: 4,
    max: 10,
    color: "orange",
    issue: "Generic copy, unclear calls-to-action, no trust signals or social proof.",
  },
  {
    label: "Image Score",
    value: 3,
    max: 10,
    color: "red",
    issue: "Low-resolution photos, inconsistent cropping, no alt text for accessibility.",
  },
];

const SCORE_IMPROVEMENTS = [
  { label: "Design", before: 3, after: 9 },
  { label: "Mobile", before: 2, after: 10 },
  { label: "Speed", before: 4, after: 9 },
  { label: "SEO", before: 5, after: 8 },
];

const PHOTO_DETECTIONS = [
  "Exterior detected — Hero section",
  "Interior detected — Gallery section",
  "Team photo detected — About section",
  "Product detected — Services section",
  "Food item detected — Menu section",
  "Logo detected — Header section",
  "Workspace detected — Features section",
  "Portrait detected — Testimonials section",
];

const VIDEO_PLACEMENTS = [
  "Hero background loop",
  "About us section",
  "Services showcase",
  "Customer testimonials",
  "Contact page embed",
];

const PAYMENT_FEATURES = [
  "Modern 2026 design applied",
  "10 photos placed intelligently",
  "5 videos optimized and placed",
  "Mobile friendly layout",
  "SEO improvements applied",
  "Content rewritten professionally",
  "Page speed optimized",
];

const TRUST_BADGES = [
  "Backend never touched",
  "Forms still work",
  "Payments still work",
  "Switch old/new in 3 minutes",
];

function colorClasses(color: ScoreColor) {
  switch (color) {
    case "red":
      return { bar: "bg-red-500", text: "text-red-400", ring: "border-red-500/30" };
    case "orange":
      return {
        bar: "bg-orange-500",
        text: "text-orange-400",
        ring: "border-orange-500/30",
      };
    case "green":
      return {
        bar: "bg-emerald-500",
        text: "text-emerald-400",
        ring: "border-emerald-500/30",
      };
  }
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
  issue,
}: (typeof HEALTH_SCORES)[number]) {
  const pct = (value / max) * 100;
  const c = colorClasses(color);

  return (
    <div className={`rounded-xl border bg-white/[0.03] p-4 sm:p-5 ${c.ring}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white/90 sm:text-base">
          {label}
        </span>
        <span className={`text-lg font-bold sm:text-xl ${c.text}`}>
          {value}/{max}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${c.bar}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-white/45 sm:text-sm">
        {issue}
      </p>
    </div>
  );
}

function OldWebsiteMock() {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-[#1a1f26] sm:min-h-[420px]">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex h-full flex-col p-3 opacity-70 blur-[0.5px] sm:p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="h-3 w-16 rounded bg-white/20" />
          <div className="flex gap-1">
            <div className="h-2 w-8 rounded bg-white/15" />
            <div className="h-2 w-8 rounded bg-white/15" />
            <div className="h-2 w-8 rounded bg-white/15" />
          </div>
        </div>
        <div className="mt-4 flex-1 space-y-3">
          <div className="h-24 rounded bg-white/10 sm:h-32" />
          <p className="text-[10px] text-white/40 sm:text-xs">
            Welcome to our website!!! Click here!!!
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-14 rounded bg-white/10" />
            <div className="h-14 rounded bg-white/10" />
            <div className="h-14 rounded bg-white/10" />
          </div>
          <div className="h-8 w-24 rounded bg-blue-900/60" />
        </div>
        <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white/50">
          OLD WEBSITE
        </span>
      </div>
    </div>
  );
}

function NewWebsiteMock() {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-[#0D1117] sm:min-h-[420px]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,76,0.35) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex h-full flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#C9A84C]">RUB</span>
          <div className="flex gap-3 text-[10px] text-white/50">
            <span>Home</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="mt-6 flex-1">
          <h3
            className="text-lg font-normal text-white sm:text-2xl"
            style={{
              fontFamily:
                'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            }}
          >
            Your Business, <span className="text-[#C9A84C]">Elevated</span>
          </h3>
          <p className="mt-2 max-w-xs text-[10px] leading-relaxed text-white/50 sm:text-xs">
            Professional design. Mobile-first. Built to convert visitors into
            customers.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-[#C9A84C] px-4 py-2 text-[10px] font-bold text-[#0D1117] sm:text-xs"
          >
            Get Started
          </button>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-lg border border-[#C9A84C]/20 bg-white/5 p-2"
              >
                <div className="mb-1 h-8 rounded bg-[#C9A84C]/20" />
                <div className="h-1.5 w-full rounded bg-white/20" />
                <div className="mt-1 h-1 w-2/3 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
        <span className="absolute right-3 bottom-3 rounded bg-[#C9A84C]/20 px-2 py-1 text-[10px] font-semibold text-[#C9A84C]">
          NEW RUB DESIGN
        </span>
      </div>
    </div>
  );
}

function BeforeAfterSlider() {
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
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-white/10 sm:aspect-[16/10]"
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
        <NewWebsiteMock />
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <OldWebsiteMock />
      </div>
      <div
        className="absolute top-0 bottom-0 z-10 w-1 bg-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.6)]"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#C9A84C] bg-[#0D1117] shadow-lg">
          <span className="text-[#C9A84C] text-xs">◀ ▶</span>
        </div>
      </div>
      <div className="pointer-events-none absolute top-3 left-3 rounded bg-black/50 px-2 py-1 text-[10px] text-white/70">
        Before
      </div>
      <div className="pointer-events-none absolute top-3 right-3 rounded bg-[#C9A84C]/20 px-2 py-1 text-[10px] font-medium text-[#C9A84C]">
        After
      </div>
    </div>
  );
}

type UploadedPhoto = {
  id: string;
  url: string;
  name: string;
  detection: string;
};

type UploadedVideo = {
  id: string;
  url: string;
  name: string;
  placement: string;
};

function UploadZone({
  accept,
  label,
  hint,
  onFiles,
  disabled,
}: {
  accept: string;
  label: string;
  hint: string;
  onFiles: (files: FileList) => void;
  disabled?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !e.dataTransfer.files.length) return;
    onFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-white/10 opacity-50"
          : dragOver
            ? "border-[#C9A84C] bg-[#C9A84C]/10"
            : "border-white/20 bg-white/[0.02] hover:border-[#C9A84C]/50 hover:bg-white/[0.04]"
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
      <span className="text-3xl" aria-hidden>
        {accept.includes("video") ? "🎬" : "📷"}
      </span>
      <p className="mt-3 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
      <p className="mt-4 text-xs text-[#C9A84C]">Drag and drop or click to browse</p>
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("yourwebsite.com");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError(false);
    try {
      await new Promise((r) => setTimeout(r, 500));
      router.push("/payment");
    } catch {
      setPublishError(true);
      setPublishing(false);
    }
  };

  useEffect(() => {
    setWebsiteUrl(displayUrl(getStoredUrl()));
  }, []);

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const paymentRef = useRef<HTMLElement>(null);
  const paymentInView = useInView(paymentRef, { once: true, margin: "-80px" });

  const handlePhotos = (files: FileList) => {
    const remaining = 10 - photos.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);

    const newPhotos: UploadedPhoto[] = toAdd.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      name: file.name,
      detection:
        PHOTO_DETECTIONS[(photos.length + i) % PHOTO_DETECTIONS.length],
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleVideos = (files: FileList) => {
    const remaining = 5 - videos.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files)
      .filter((f) => f.type.startsWith("video/"))
      .slice(0, remaining);

    const newVideos: UploadedVideo[] = toAdd.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      name: file.name,
      placement: VIDEO_PLACEMENTS[(videos.length + i) % VIDEO_PLACEMENTS.length],
    }));
    setVideos((prev) => [...prev, ...newVideos]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => {
      const item = prev.find((v) => v.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((v) => v.id !== id);
    });
  };

  return (
    <div
      className="min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: DARK }}
    >
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0D1117]/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a href="/" className="text-xl font-bold text-[#C9A84C]">
            RUB
          </a>
          <span className="max-w-[50%] truncate text-xs text-white/40 sm:text-sm">
            {websiteUrl}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {publishError && (
          <div className="mb-8">
            <FriendlyError onRetry={() => setPublishError(false)} />
          </div>
        )}

        {/* SECTION 1 — HEALTH REPORT */}
        <FadeUp>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-[#C9A84C]">
              Analysis complete
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">
              Website Health Report
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Scores for your current website before RUB redesign
            </p>
          </div>
        </FadeUp>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {HEALTH_SCORES.map((score, i) => (
            <FadeUp
              key={score.label}
              delay={i * 0.05}
              className={score.label === "Overall Score" ? "sm:col-span-2" : ""}
            >
              <ScoreBar {...score} />
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">
                  Estimated customers lost per month
                </p>
                <p className="mt-1 text-3xl font-bold text-red-400">47</p>
              </div>
              <div className="hidden h-12 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-sm text-white/60">
                  Estimated revenue lost per month
                </p>
                <p className="mt-1 text-3xl font-bold text-red-400">$2,350</p>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* SECTION 2 — UPLOAD */}
        <section className="mt-20 border-t border-white/10 pt-16">
          <FadeUp>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Now add your business photos and videos
            </h2>
            <p className="mt-2 text-sm text-white/50 sm:text-base">
              Our AI will enhance and place them perfectly
            </p>
          </FadeUp>

          <FadeUp className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-[#C9A84C]">
              Photos ({photos.length}/10)
            </h3>
            <UploadZone
              accept="image/*"
              label="Upload business photos"
              hint="JPG, PNG, WEBP — up to 10 photos"
              onFiles={handlePhotos}
              disabled={photos.length >= 10}
            />
          </FadeUp>

          {photos.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                  <div className="border-t border-white/10 bg-[#0D1117]/90 p-2">
                    <p className="text-[10px] leading-snug text-[#C9A84C] sm:text-xs">
                      {photo.detection}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <FadeUp className="mt-10">
            <h3 className="mb-3 text-sm font-semibold text-[#C9A84C]">
              Videos ({videos.length}/5)
            </h3>
            <UploadZone
              accept="video/*"
              label="Upload business videos"
              hint="MP4, MOV, WEBM — up to 5 videos"
              onFiles={handleVideos}
              disabled={videos.length >= 5}
            />
          </FadeUp>

          {videos.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  <div className="relative aspect-video bg-black/40">
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
                    <button
                      type="button"
                      onClick={() => removeVideo(video.id)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                      aria-label="Remove video"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs text-white/50">
                      {video.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#C9A84C]">
                      → {video.placement}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3 — BEFORE / AFTER */}
        <section className="mt-20 border-t border-white/10 pt-16">
          <FadeUp>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Before &amp; After Preview
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Drag the slider to compare your old site with the new RUB redesign
            </p>
          </FadeUp>

          <FadeUp className="mt-8">
            <BeforeAfterSlider />
          </FadeUp>

          <FadeUp className="mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SCORE_IMPROVEMENTS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-4 text-center"
                >
                  <p className="text-xs text-white/50">{item.label}</p>
                  <p className="mt-2 text-sm font-bold sm:text-base">
                    <span className="text-red-400">{item.before}/10</span>
                    <span className="mx-1 text-white/30">→</span>
                    <span className="text-[#C9A84C]">{item.after}/10</span>
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* SECTION 4 — PAYMENT (below preview) */}
        <section
          ref={paymentRef}
          className="mt-20 border-t border-white/10 pt-16 pb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={paymentInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-lg rounded-3xl border border-[#C9A84C]/30 bg-white/[0.04] p-8 text-center sm:p-10"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Your new website is ready!
            </h2>
            <p className="mt-3 text-sm text-white/50 sm:text-base">
              Love what you see? Go live for $39
            </p>

            <ul className="mx-auto mt-8 max-w-sm space-y-2.5 text-left text-sm text-white/80">
              {PAYMENT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-[#C9A84C]">✅</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-4 text-base font-bold text-[#0D1117] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 sm:text-lg"
            >
              {publishing && <Spinner />}
              Publish My New Website — $39
            </button>

            <p className="mt-4 text-xs text-white/40">
              30 day money back guarantee • Switch back anytime
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-white/50">
              {TRUST_BADGES.map((badge) => (
                <span key={badge} className="flex items-center gap-1">
                  <span className="text-[#C9A84C]">✅</span> {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function ResultsFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center text-white/50"
      style={{ backgroundColor: DARK }}
    >
      Loading results...
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
