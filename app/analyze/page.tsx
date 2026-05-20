"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { displayUrl, getStoredUrl } from "@/lib/rub-storage";

const DARK = "#0D1117";
const GOLD = "#C9A84C";
const TICK_MS = 40;
const AGENT_MS = 3000;
const PROGRESS_STEP = 100 / (AGENT_MS / TICK_MS);
const COUNTDOWN_START = 10 * 60;

const AGENTS = [
  {
    emoji: "🔍",
    name: "Scout",
    description: "Scanning all pages and reading your code",
    feed: "Scout found 8 pages to analyze...",
  },
  {
    emoji: "🧠",
    name: "Einstein",
    description: "Understanding your business and audience",
    feed: "Einstein detected: Restaurant business",
  },
  {
    emoji: "👁",
    name: "Critic",
    description: "Grading your current design quality",
    feed: "Critic found 12 design issues...",
  },
  {
    emoji: "📈",
    name: "SEO Guy",
    description: "Checking how Google sees your website",
    feed: "SEO Guy found 8 ranking problems...",
  },
  {
    emoji: "✍️",
    name: "Writer",
    description: "Rewriting your content to convert better",
    feed: "Writer is rewriting your homepage copy...",
  },
  {
    emoji: "🎨",
    name: "Picasso",
    description: "Generating your unique new design",
    feed: "Picasso is creating your color palette...",
  },
  {
    emoji: "📸",
    name: "Ansel",
    description: "Enhancing and placing your photos",
    feed: "Ansel enhanced 3 photos...",
  },
  {
    emoji: "🎬",
    name: "Spielberg",
    description: "Optimizing and placing your videos",
    feed: "Spielberg optimized 2 videos...",
  },
  {
    emoji: "✅",
    name: "Rex",
    description: "Running quality checks on everything",
    feed: "Rex passed all quality checks...",
  },
  {
    emoji: "🚀",
    name: "Publisher",
    description: "Preparing your design for publishing",
    feed: "Publisher prepared your live preview...",
  },
] as const;

type AgentStatus = "waiting" | "working" | "done";

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 60%)",
        }}
      />
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-[#C9A84C]/50"
          style={{ left: `${(i * 13 + 5) % 95}%`, bottom: "10%" }}
          animate={{ y: [0, -500], opacity: [0, 0.7, 0] }}
          transition={{
            duration: 5 + (i % 4),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function AgentCard({
  agent,
  status,
  progress,
}: {
  agent: (typeof AGENTS)[number];
  status: AgentStatus;
  progress: number;
}) {
  const isWaiting = status === "waiting";
  const isWorking = status === "working";
  const isDone = status === "done";

  return (
    <motion.div
      layout
      animate={
        isWorking
          ? {
              boxShadow: [
                "0 0 0px rgba(201,168,76,0)",
                "0 0 28px rgba(201,168,76,0.35)",
                "0 0 0px rgba(201,168,76,0)",
              ],
            }
          : {}
      }
      transition={
        isWorking
          ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
      className={`flex flex-col rounded-2xl border p-4 text-center transition-colors sm:p-5 ${
        isWorking
          ? "border-[#C9A84C]/60 bg-[#C9A84C]/10"
          : isDone
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-white/10 bg-white/[0.02] opacity-45"
      }`}
    >
      <span
        className={`text-4xl sm:text-5xl ${isWorking ? "animate-pulse" : ""}`}
        aria-hidden
      >
        {agent.emoji}
      </span>

      <p className="mt-3 text-sm font-bold text-[#C9A84C] sm:text-base">
        {agent.name}
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-white/45 sm:text-xs">
        {agent.description}
      </p>

      <p
        className={`mt-3 text-[10px] font-medium sm:text-xs ${
          isDone
            ? "text-emerald-400"
            : isWorking
              ? "text-[#C9A84C]"
              : "text-white/25"
        }`}
      >
        {isDone ? "Done ✅" : isWorking ? "Working..." : "Waiting"}
      </p>

      <div className="mt-3 flex justify-center">
        {isDone ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white"
          >
            ✓
          </motion.span>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${
            isDone
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-[#C9A84C] to-[#e8c96a]"
          }`}
          initial={false}
          animate={{ width: `${isDone ? 100 : progress}%` }}
          transition={{ duration: 0.08, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1117]/95 px-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="max-w-md rounded-3xl border border-[#C9A84C]/40 bg-[#0D1117] p-10 text-center shadow-[0_0_80px_rgba(201,168,76,0.2)]"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#C9A84C] text-5xl font-bold text-[#0D1117] shadow-lg shadow-[#C9A84C]/30"
        >
          ✓
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 text-2xl font-bold text-white sm:text-3xl"
        >
          Analysis Complete! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-3 text-sm text-white/55 sm:text-base"
        >
          Your new website is ready to preview
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-[#C9A84C]"
        >
          Redirecting to your results...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function AnalyzeContent() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [progresses, setProgresses] = useState<number[]>(() =>
    AGENTS.map(() => 0)
  );
  const [statuses, setStatuses] = useState<AgentStatus[]>(() =>
    AGENTS.map((_, i) => (i === 0 ? "working" : "waiting"))
  );
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [feed, setFeed] = useState<string[]>(["🔍 Scout is starting analysis..."]);
  const [agentsComplete, setAgentsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const feedAddedRef = useRef<Set<number>>(new Set());
  const simRef = useRef({
    progresses: AGENTS.map(() => 0),
    statuses: AGENTS.map((_, i) =>
      (i === 0 ? "working" : "waiting") as AgentStatus
    ),
  });

  const overallProgress =
    progresses.reduce((a, b) => a + b, 0) / AGENTS.length;

  const redirectedRef = useRef(false);

  useEffect(() => {
    setWebsiteUrl(displayUrl(getStoredUrl()));
  }, []);

  useEffect(() => {
    if (!agentsComplete) return;
    const t1 = setTimeout(() => setShowSuccess(true), 1000);
    return () => clearTimeout(t1);
  }, [agentsComplete]);

  useEffect(() => {
    if (!showSuccess || redirectedRef.current) return;
    redirectedRef.current = true;
    const timer = setTimeout(() => router.push("/results"), 2000);
    return () => clearTimeout(timer);
  }, [showSuccess, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (agentsComplete) return;

    const interval = setInterval(() => {
      const { progresses: prog, statuses: stat } = simRef.current;

      for (let i = 0; i < AGENTS.length; i++) {
        if (stat[i] === "working") {
          prog[i] = Math.min(prog[i] + PROGRESS_STEP, 100);
          if (prog[i] >= 100) {
            stat[i] = "done";
            if (i + 1 < AGENTS.length && stat[i + 1] === "waiting") {
              stat[i + 1] = "working";
            }
          }
        }
      }

      for (let i = 0; i < AGENTS.length; i++) {
        if (stat[i] === "working" && !feedAddedRef.current.has(i)) {
          feedAddedRef.current.add(i);
          setFeed((f) => [...f, AGENTS[i].feed]);
        }
      }

      setProgresses([...prog]);
      setStatuses([...stat]);

      if (stat.every((s) => s === "done")) {
        setAgentsComplete(true);
        setFeed((f) => {
          const doneMsg =
            "✨ All 10 agents finished — your redesign is ready!";
          return f.includes(doneMsg) ? f : [...f, doneMsg];
        });
        clearInterval(interval);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [agentsComplete]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feed]);

  return (
    <div
      className="relative min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: DARK }}
    >
      <BackgroundEffects />
      <AnimatePresence>
        {showSuccess && <SuccessScreen />}
      </AnimatePresence>

      <header className="relative z-10 border-b border-white/5 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <span className="text-xl font-bold text-[#C9A84C]">RUB</span>
          <p className="mt-3 text-lg font-semibold text-white sm:text-xl">
            Analyzing{" "}
            <span className="text-[#C9A84C]">{websiteUrl}</span>
          </p>

          <div className="mt-5 rounded-2xl border border-[#C9A84C]/20 bg-white/[0.04] p-4 sm:p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-wide text-white/45 uppercase">
                  Overall progress
                </p>
                <p className="text-3xl font-bold text-[#C9A84C] sm:text-4xl">
                  {Math.round(overallProgress)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/45">Time remaining</p>
                <p className="font-mono text-2xl font-bold text-white sm:text-3xl">
                  {formatCountdown(countdown)}
                </p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] via-[#e8c96a] to-[#C9A84C]"
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.12, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {AGENTS.map((agent, i) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              status={statuses[i]}
              progress={progresses[i]}
            />
          ))}
        </div>

        <div className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9A84C] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C9A84C]" />
            </span>
            <p className="text-sm font-semibold text-[#C9A84C]">Live feed</p>
          </div>
          <div
            ref={feedRef}
            className="h-40 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4 scroll-smooth sm:h-48"
          >
            <AnimatePresence initial={false}>
              {feed.map((msg, i) => (
                <motion.p
                  key={`${msg}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-b border-white/5 py-2 text-sm text-white/70 last:border-0"
                >
                  <span className="text-[#C9A84C]">›</span> {msg}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function AnalyzeFallback() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3"
      style={{ backgroundColor: DARK }}
    >
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-[#C9A84C] border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-sm text-white/40">Initializing agents...</p>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<AnalyzeFallback />}>
      <AnalyzeContent />
    </Suspense>
  );
}
