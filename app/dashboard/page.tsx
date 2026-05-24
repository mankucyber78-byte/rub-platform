"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ConfirmModal,
  ProgressOverlay,
  Spinner,
  SuccessBanner,
} from "@/components/rub-ui";
import {
  FadeUp,
  GlassCard,
  LiveDot,
  PageTransition,
  PremiumProgressBar,
} from "@/components/rub-premium";
import { displayUrl, getStoredUrl } from "@/lib/rub-storage";

const DARK = "#0D1117";

const HEALTH_CHECKS = [
  { label: "Website Online", detail: "Checked 5 mins ago" },
  { label: "Pages Loading", detail: "All 8 pages working" },
  { label: "Forms Working", detail: "Contact form tested" },
  { label: "Mobile Perfect", detail: "Score 98/100" },
];

const SCORE_IMPROVEMENTS = [
  { label: "Design", before: 3, after: 9, delta: 6 },
  { label: "Mobile", before: 2, after: 10, delta: 8 },
  { label: "Speed", before: 4, after: 9, delta: 5 },
  { label: "SEO", before: 5, after: 8, delta: 3 },
];

const QUICK_ACTIONS = [
  { emoji: "📸", title: "Update Photos", desc: "Upload new business photos" },
  { emoji: "🎨", title: "Refresh Design", desc: "Request a design update" },
  { emoji: "📊", title: "View Full Report", desc: "See detailed analytics" },
  { emoji: "🚨", title: "Emergency Restore", desc: "Restore original instantly" },
];

const ACTIVITY = [
  { emoji: "🚀", text: "New design published", time: "Today 2:34 PM" },
  { emoji: "✅", text: "Health check passed", time: "Today 2:36 PM" },
  { emoji: "📸", text: "3 photos enhanced", time: "Today 2:30 PM" },
  { emoji: "🔍", text: "Website scanned", time: "Today 2:20 PM" },
];

function ScoreRow({
  label,
  before,
  after,
  delta,
  delay,
}: (typeof SCORE_IMPROVEMENTS)[number] & { delay: number }) {
  return (
    <FadeUp delay={delay}>
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-white">{label}</span>
          <span className="text-sm font-medium text-emerald-400">
            +{delta} improvement
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm sm:text-base">
          <span className="text-red-400/90">{before}/10</span>
          <span className="text-white/30">→</span>
          <span className="font-bold text-[#C9A84C]">{after}/10</span>
        </div>
        <PremiumProgressBar value={after * 10} className="mt-4" />
      </GlassCard>
    </FadeUp>
  );
}

export default function DashboardPage() {
  const [websiteUrl, setWebsiteUrl] = useState("myrestaurant.com");
  const [activeDesign, setActiveDesign] = useState<"new" | "old">("new");
  const [switchMessage, setSwitchMessage] = useState("");

  const [confirmOld, setConfirmOld] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchProgress, setSwitchProgress] = useState(0);
  const [switchTitle, setSwitchTitle] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  useEffect(() => {
    setWebsiteUrl(displayUrl(getStoredUrl()));
  }, []);

  const runSwitch = (target: "old" | "new") => {
    setConfirmOld(false);
    setConfirmNew(false);
    setSwitching(true);
    setSwitchProgress(0);
    setSwitchTitle(
      target === "old" ? "Switching to Old Design..." : "Switching to New Design..."
    );

    const interval = setInterval(() => {
      setSwitchProgress((p) => {
        const next = p + 4;
        if (next >= 100) {
          clearInterval(interval);
          setSwitching(false);
          setActiveDesign(target);
          setSwitchMessage(
            target === "old"
              ? "Switched to Old Design ✅"
              : "Switched to New Design ✅"
          );
          setTimeout(() => setSwitchMessage(""), 4000);
        }
        return Math.min(next, 100);
      });
    }, 120);
  };

  const runRestore = () => {
    setConfirmRestore(false);
    setRestoring(true);
    setRestoreProgress(0);

    const interval = setInterval(() => {
      setRestoreProgress((p) => {
        const next = p + 3;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setRestoring(false);
            setActiveDesign("old");
            setSwitchMessage("Original website restored ✅");
            setTimeout(() => setSwitchMessage(""), 4000);
          }, 500);
        }
        return Math.min(next, 100);
      });
    }, 100);
  };

  return (
    <PageTransition>
    <div
      className="min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: DARK }}
    >
      <ProgressOverlay
        open={switching}
        title={switchTitle}
        progress={switchProgress}
        message="This takes about 3 minutes"
      />
      <ProgressOverlay
        open={restoring}
        title="Restoring original website..."
        progress={restoreProgress}
        message="Your backup is being applied"
      />

      <ConfirmModal
        open={confirmOld}
        title="Switch to Old Design?"
        message="Are you sure? This will switch your website to the old design."
        confirmLabel="Yes Switch Now"
        loading={switching}
        onConfirm={() => runSwitch("old")}
        onCancel={() => setConfirmOld(false)}
      />
      <ConfirmModal
        open={confirmNew}
        title="Switch to New Design?"
        message="Are you sure? This will switch your website to the new RUB design."
        confirmLabel="Yes Switch Now"
        loading={switching}
        onConfirm={() => runSwitch("new")}
        onCancel={() => setConfirmNew(false)}
      />
      <ConfirmModal
        open={confirmRestore}
        variant="danger"
        title="Emergency Restore"
        message="This will restore your original website. Are you absolutely sure?"
        confirmLabel="Yes Restore Now"
        loading={restoring}
        onConfirm={runRestore}
        onCancel={() => setConfirmRestore(false)}
      />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0D1117]/95 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <a href="/" className="shrink-0 text-xl font-bold text-[#C9A84C]">
            RUB
          </a>
          <p className="truncate text-center text-xs text-white/60 sm:text-sm">
            {websiteUrl}
          </p>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 sm:px-4 sm:text-sm"
          >
            Account
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <FadeUp>
          <GlassCard gold className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <LiveDot />
              <span className="text-sm font-semibold text-emerald-400">
                {activeDesign === "new" ? "New Design Active" : "Old Design Active"}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              {websiteUrl}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Last updated: Today at 2:34 PM
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
              <span className="text-emerald-400">✅</span>
              Health status: All systems healthy
            </p>

            {switchMessage && (
              <SuccessBanner message={switchMessage} />
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={switching || restoring}
                onClick={() => setConfirmOld(true)}
                className={`rounded-xl border px-5 py-4 text-sm font-semibold transition-all sm:text-base disabled:opacity-50 ${
                  activeDesign === "old"
                    ? "border-[#C9A84C] bg-[#C9A84C] text-[#0D1117] shadow-[0_0_24px_rgba(201,168,76,0.35)]"
                    : "border-white/20 bg-white/5 text-white hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10"
                }`}
              >
                Switch to Old Design
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={switching || restoring}
                onClick={() => setConfirmNew(true)}
                className={`rounded-xl border px-5 py-4 text-sm font-semibold transition-all sm:text-base disabled:opacity-50 ${
                  activeDesign === "new"
                    ? "border-[#C9A84C] bg-[#C9A84C] text-[#0D1117] shadow-[0_0_24px_rgba(201,168,76,0.35)]"
                    : "border-white/20 bg-white/5 text-white hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/10"
                }`}
              >
                Switch to New Design
              </motion.button>
            </div>

            <p className="mt-5 text-center text-xs text-white/45 sm:text-sm">
              Switch happens in under 3 minutes
            </p>
            <p className="mt-1 text-center text-xs text-[#C9A84C]/80 sm:text-sm">
              Your original design is safely backed up
            </p>
          </GlassCard>
        </FadeUp>

        <section className="mt-10">
          <FadeUp>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Website Health Monitor
            </h2>
          </FadeUp>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {HEALTH_CHECKS.map((check, i) => (
              <FadeUp key={check.label} delay={i * 0.06}>
                <GlassCard className="flex items-start gap-3 border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
                  <span className="text-lg text-emerald-400">✅</span>
                  <div>
                    <p className="font-semibold text-white">{check.label}</p>
                    <p className="mt-0.5 text-xs text-white/45 sm:text-sm">
                      {check.detail}
                    </p>
                  </div>
                </GlassCard>
              </FadeUp>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <FadeUp>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Score Improvements
            </h2>
          </FadeUp>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SCORE_IMPROVEMENTS.map((score, i) => (
              <ScoreRow key={score.label} {...score} delay={i * 0.08} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <FadeUp>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Quick Actions
            </h2>
          </FadeUp>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action, i) => (
              <FadeUp key={action.title} delay={i * 0.05}>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    action.title === "Emergency Restore"
                      ? setConfirmRestore(true)
                      : undefined
                  }
                  className="group w-full text-left"
                >
                  <GlassCard
                    className={`p-5 transition-all sm:p-6 ${
                      action.title === "Emergency Restore"
                        ? "hover:border-red-500/40 hover:bg-red-500/5"
                        : "hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {action.emoji}
                    </span>
                    <p
                      className={`mt-3 font-semibold text-white ${
                        action.title === "Emergency Restore"
                          ? "group-hover:text-red-300"
                          : "group-hover:text-[#C9A84C]"
                      }`}
                    >
                      {action.title}
                    </p>
                    <p className="mt-1 text-sm text-white/45">{action.desc}</p>
                  </GlassCard>
                </motion.button>
              </FadeUp>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <FadeUp>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Recent Activity
            </h2>
          </FadeUp>
          <FadeUp className="mt-4">
            <GlassCard className="p-5 sm:p-6">
              <ul className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-[#C9A84C]/40 via-white/10 to-transparent" />
                {ACTIVITY.map((item) => (
                  <li
                    key={item.text}
                    className="relative flex gap-4 py-4 pl-2 first:pt-0 last:pb-0"
                  >
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#0D1117] text-sm">
                      {item.emoji}
                    </span>
                    <div>
                      <p className="font-medium text-white">{item.text}</p>
                      <p className="text-xs text-white/40">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </FadeUp>
        </section>

        <FadeUp className="mt-10">
          <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/20 border-l-4 border-l-[#C9A84C] bg-[rgba(201,168,76,0.08)] p-8 sm:p-10">
            <motion.span
              animate={{ scale: [1, 1.14, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block text-3xl"
              aria-hidden
            >
              ❤️
            </motion.span>
            <h2 className="rub-font-display mt-4 text-xl font-semibold text-[#C9A84C] sm:text-2xl">
              Your generosity
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
              7% of your payment went to old age homes, orphanages and children&apos;s
              education.
            </p>
            <p className="rub-font-display mt-5 text-sm italic text-white/50 sm:text-base">
              Thank you for making a real difference — your order helps someone who needs it.
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mt-10">
          <GlassCard className="border-2 border-red-500/40 bg-red-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Something not right?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              Restore your original website in under 3 minutes. One click.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={restoring || switching}
              onClick={() => setConfirmRestore(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/20 px-6 py-4 text-sm font-bold text-red-300 transition-all hover:bg-red-500/30 disabled:opacity-50 sm:w-auto sm:text-base"
            >
              {restoring && <Spinner />}
              🚨 Restore Original Website
            </motion.button>
            <p className="mt-4 text-xs text-white/35 sm:text-sm">
              Available 24 hours a day · 365 days a year
            </p>
          </GlassCard>
        </FadeUp>
      </main>
    </div>
    </PageTransition>
  );
}
