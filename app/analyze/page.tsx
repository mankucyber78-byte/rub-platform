"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  displayUrl,
  getStoredUrl,
  getStoredUser,
  isConnected,
  isVerified,
  normalizeUrl,
  setStoredAnalysis,
} from "@/lib/rub-storage";
import type { AgentName } from "@/lib/agents/types";
import {
  buildMockFeedSteps,
  generateMockAnalysisResult,
  MOCK_AGENT_DURATIONS_MS,
  MOCK_AGENT_ORDER,
  MOCK_TOTAL_DURATION_MS,
  sleep,
} from "@/lib/mock-analysis";
import {
  GoldConfetti,
  GoldParticles,
  SkeletonPage,
} from "@/components/rub-premium";

const BG = "#080B10";
const CARD = "#0D1117";
const EASE = [0.22, 1, 0.36, 1] as const;

const AGENT_KEYS: AgentName[] = [
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

const AGENTS = [
  {
    emoji: "🔍",
    name: "Scout",
    lines: ["Scanning all pages...", "Reading HTML structure...", "Mapping site architecture..."],
  },
  {
    emoji: "🧠",
    name: "Einstein",
    lines: ["Analyzing business type...", "Identifying target audience...", "Mapping brand personality..."],
  },
  {
    emoji: "👁",
    name: "Critic",
    lines: ["Grading design quality...", "Auditing typography...", "Scoring mobile readiness..."],
  },
  {
    emoji: "📈",
    name: "SEO Guy",
    lines: ["Checking Google signals...", "Auditing meta tags...", "Finding ranking gaps..."],
  },
  {
    emoji: "✍️",
    name: "Writer",
    lines: ["Reviewing homepage copy...", "Rewriting hero headline...", "Strengthening CTAs..."],
  },
  {
    emoji: "🎨",
    name: "Picasso",
    lines: ["Building color palette...", "Designing hero layout...", "Crafting premium components..."],
  },
  {
    emoji: "📸",
    name: "Ansel",
    lines: ["Scanning image assets...", "Enhancing photo quality...", "Placing hero imagery..."],
  },
  {
    emoji: "🎬",
    name: "Spielberg",
    lines: ["Locating video assets...", "Optimizing for mobile...", "Placing background loops..."],
  },
  {
    emoji: "✅",
    name: "Rex",
    lines: ["Running quality checks...", "Validating consistency...", "Verifying mobile breakpoints..."],
  },
  {
    emoji: "🚀",
    name: "Publisher",
    lines: ["Packaging CSS bundle...", "Preparing live preview...", "Staging deployment..."],
  },
] as const;

type AgentStatus = "waiting" | "working" | "done";

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function TypewriterStatus({ text }: { text: string }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplay("");
      return;
    }
    setDisplay("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span className="min-h-[2.5em] text-[10px] leading-snug text-[#C9A84C]/90 sm:text-xs">
      {display}
      {display.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ml-0.5 inline-block h-3 w-0.5 bg-[#C9A84C]"
        />
      )}
    </span>
  );
}

function AgentCard({
  agent,
  status,
  progress,
  statusText,
}: {
  agent: (typeof AGENTS)[number];
  status: AgentStatus;
  progress: number;
  statusText: string;
}) {
  const isWaiting = status === "waiting";
  const isWorking = status === "working";
  const isDone = status === "done";

  return (
    <motion.div
      layout
      animate={{
        y: isWorking ? -4 : 0,
        opacity: isDone ? 0.72 : 1,
      }}
      transition={{ duration: 0.35, ease: EASE }}
      className={`relative flex flex-col rounded-xl border p-3.5 sm:p-4 ${
        isWaiting
          ? "border-white/[0.05]"
          : isWorking
            ? "rub-agent-pulse border-[#C9A84C] bg-[#C9A84C]/[0.08] shadow-[0_0_24px_rgba(201,168,76,0.25)]"
            : "border-emerald-500/25 bg-[#0D1117]"
      }`}
      style={{ backgroundColor: isWaiting || isDone ? CARD : undefined }}
    >
      {isDone && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/30"
        >
          ✓
        </motion.div>
      )}

      <motion.span
        animate={isWorking ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.6, repeat: isWorking ? Infinity : 0, ease: "easeInOut" }}
        className={`text-3xl sm:text-4xl ${isWaiting ? "opacity-40" : "opacity-100"}`}
        aria-hidden
      >
        {agent.emoji}
      </motion.span>

      <p
        className={`mt-2.5 text-sm font-semibold sm:text-base ${
          isWaiting
            ? "text-white/35"
            : isWorking
              ? "text-[#C9A84C]"
              : "text-white"
        }`}
      >
        {agent.name}
      </p>

      <div className="mt-2 flex-1">
        {isWaiting && (
          <p className="text-[10px] text-white/25 sm:text-xs">Waiting...</p>
        )}
        {isWorking && <TypewriterStatus text={statusText || agent.lines[0]} />}
        {isDone && (
          <p className="text-[10px] font-medium text-emerald-400 sm:text-xs">Complete</p>
        )}
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={`h-full rounded-full ${
            isDone
              ? "bg-emerald-500"
              : isWorking
                ? "rub-progress-bar"
                : "bg-white/10"
          }`}
          initial={false}
          animate={{ width: `${isDone ? 100 : isWaiting ? 0 : progress}%` }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

function SvgCheckmark() {
  return (
    <svg viewBox="0 0 52 52" className="h-24 w-24 sm:h-28 sm:w-28">
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      <motion.path
        fill="none"
        stroke="#C9A84C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 27l8 8 16-18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
      />
    </svg>
  );
}

function SuccessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <GoldConfetti active />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/95 px-4 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#C9A84C]/10">
            <SvgCheckmark />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rub-font-display mt-8 text-3xl font-bold text-white sm:text-4xl"
          >
            Analysis Complete!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-3 text-base text-white/55"
          >
            Your new website is ready
          </motion.p>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="rub-btn-gold rub-btn-shimmer relative mt-10 w-full rounded-xl px-6 py-4 text-base font-bold sm:text-lg"
          >
            See My New Website
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mt-5 text-xs text-white/35"
          >
            Redirecting automatically in 3 seconds...
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  );
}

function CommandCenterBackground() {
  return (
    <>
      <div className="rub-command-grid pointer-events-none absolute inset-0" />
      <div className="rub-radial-glow pointer-events-none absolute inset-0" />
      <GoldParticles />
    </>
  );
}

function AnalyzeContent() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [progresses, setProgresses] = useState<number[]>(() => AGENTS.map(() => 0));
  const [statuses, setStatuses] = useState<AgentStatus[]>(() =>
    AGENTS.map(() => "waiting")
  );
  const [statusTexts, setStatusTexts] = useState<string[]>(() => AGENTS.map(() => ""));
  const [feed, setFeed] = useState<string[]>([]);
  const [agentsComplete, setAgentsComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  const completedAgents = statuses.filter((s) => s === "done").length;
  const workingIdx = statuses.findIndex((s) => s === "working");
  const activeFraction = workingIdx >= 0 ? progresses[workingIdx] / 100 : 0;
  const overallProgress =
    ((completedAgents + activeFraction) / AGENTS.length) * 100;

  const countdownSeconds = Math.max(
    0,
    Math.ceil((MOCK_TOTAL_DURATION_MS * (1 - overallProgress / 100)) / 1000)
  );

  const agentIndex = (name: AgentName) => AGENT_KEYS.indexOf(name);

  const patchAgent = (
    name: AgentName,
    patch: Partial<{ progress: number; status: AgentStatus; statusText: string }>
  ) => {
    const i = agentIndex(name);
    if (i < 0) return;

    if (patch.progress !== undefined) {
      setProgresses((prev) => {
        const next = [...prev];
        next[i] = patch.progress!;
        return next;
      });
    }
    if (patch.status) {
      setStatuses((prev) => {
        const next = [...prev];
        next[i] = patch.status!;
        return next;
      });
    }
    if (patch.statusText !== undefined) {
      setStatusTexts((prev) => {
        const next = [...prev];
        next[i] = patch.statusText!;
        return next;
      });
    }
  };

  useEffect(() => {
    cancelledRef.current = false;

    const raw = getStoredUrl();
    const url = normalizeUrl(raw);
    if (!url) {
      routerRef.current.replace("/");
      return;
    }
    if (!getStoredUser()) {
      routerRef.current.replace("/sign-up");
      return;
    }
    if (!isVerified()) {
      routerRef.current.replace("/verify");
      return;
    }
    if (!isConnected()) {
      routerRef.current.replace("/connect");
      return;
    }

    const startAnalysis = async () => {
      const domain = displayUrl(url);
      const feedSteps = buildMockFeedSteps(domain);

      setWebsiteUrl(domain);
      setProgresses(AGENTS.map(() => 0));
      setStatuses(AGENTS.map(() => "waiting"));
      setStatusTexts(AGENTS.map(() => ""));
      setFeed([`> Initializing 10 AI agents for ${domain}...`]);

      await sleep(400);
      if (cancelledRef.current) return;

      for (const agentKey of MOCK_AGENT_ORDER) {
        if (cancelledRef.current) return;

        const i = agentIndex(agentKey);
        const duration = MOCK_AGENT_DURATIONS_MS[agentKey];
        const steps = feedSteps[agentKey];
        const shown = new Set<number>();
        const tickMs = 80;
        const ticks = Math.max(1, Math.ceil(duration / tickMs));

        patchAgent(agentKey, {
          status: "working",
          progress: 0,
          statusText: AGENTS[i]?.lines[0] ?? "Working...",
        });

        setFeed((f) => [...f, `> ${AGENTS[i]?.name} agent started...`]);

        for (let t = 0; t <= ticks; t++) {
          if (cancelledRef.current) return;

          const progress = Math.min(100, Math.round((t / ticks) * 100));
          patchAgent(agentKey, { progress });

          for (const step of steps) {
            if (progress >= step.at && !shown.has(step.at)) {
              shown.add(step.at);
              setFeed((f) => [...f, `> ${step.message}`]);
              patchAgent(agentKey, {
                statusText: step.message.replace(/ ✅$/, ""),
              });
            }
          }

          if (t < ticks) await sleep(tickMs);
        }

        patchAgent(agentKey, { status: "done", progress: 100 });
        setFeed((f) => [...f, `> ${AGENTS[i]?.name} complete ✓`]);
        await sleep(120);
      }

      if (cancelledRef.current) return;

      setStoredAnalysis(generateMockAnalysisResult(url));
      setFeed((f) => [...f, "> All 10 agents finished — redesign ready ✓"]);
      setAgentsComplete(true);
    };

    void startAnalysis();

    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!agentsComplete) return;
    const t1 = setTimeout(() => setShowSuccess(true), 800);
    return () => clearTimeout(t1);
  }, [agentsComplete]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => router.push("/results"), 3000);
    return () => clearTimeout(timer);
  }, [showSuccess, router]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feed]);

  return (
    <div
      className="relative min-h-screen text-white antialiased"
      style={{ backgroundColor: BG }}
    >
      <CommandCenterBackground />

      <AnimatePresence>
        {showSuccess && (
          <SuccessScreen onContinue={() => router.push("/results")} />
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
            <span className="text-emerald-400">✅ Account verified</span>
            <span className="text-emerald-400">✅ Website ownership confirmed</span>
            <span className="text-emerald-400">
              ✅ {websiteUrl || "yourwebsite.com"} connected
            </span>
          </div>
          <p className="mt-2 text-xs text-[#C9A84C]/90 sm:text-sm">Starting your analysis...</p>
        </motion.div>

        <header>
          <span className="text-lg font-bold tracking-wide text-[#C9A84C] sm:text-xl">
            RUB
          </span>
          <h1 className="mt-4 text-lg font-medium text-white/80 sm:text-xl">
            Analyzing{" "}
            <span className="font-semibold text-[#C9A84C]">
              {websiteUrl || "yourwebsite.com"}
            </span>
          </h1>

          <div className="mt-6">
            <div className="mb-2 flex items-end justify-between gap-4">
              <motion.span
                key={Math.round(overallProgress)}
                initial={{ opacity: 0.6, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-[#C9A84C] sm:text-4xl"
              >
                {Math.round(overallProgress)}%
              </motion.span>
              <p className="text-right text-xs text-white/45 sm:text-sm">
                Estimated time remaining:{" "}
                <span className="font-mono text-sm font-semibold text-white/80 sm:text-base">
                  {formatCountdown(countdownSeconds)}
                </span>
              </p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="rub-progress-bar h-full rounded-full"
                initial={false}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>
        </header>

        <main className="mt-8">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {AGENTS.map((agent, i) => (
              <AgentCard
                key={agent.name}
                agent={agent}
                status={statuses[i]}
                progress={progresses[i]}
                statusText={statusTexts[i]}
              />
            ))}
          </div>

          <div className="mt-8">
            <p className="mb-2 text-[10px] font-medium tracking-widest text-[#C9A84C]/70 uppercase sm:text-xs">
              Live feed
            </p>
            <div
              ref={feedRef}
              className="rub-terminal rub-scanlines relative max-h-[160px] overflow-y-auto rounded-lg p-3 scroll-smooth sm:max-h-[200px] sm:p-4"
            >
              <AnimatePresence initial={false}>
                {feed.map((msg, i) => (
                  <motion.p
                    key={`${msg}-${i}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="font-mono text-[11px] leading-relaxed text-emerald-400/85 sm:text-xs"
                  >
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
                    {msg.replace(/^>\s*/, "")}
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AnalyzeFallback() {
  return (
    <div style={{ backgroundColor: BG }}>
      <SkeletonPage />
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
