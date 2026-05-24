"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AuthBackground,
  FlowProgressBar,
  GoldPrimaryButton,
  OutlineButton,
  StepDots,
  SuccessOverlay,
} from "@/components/rub-auth-ui";
import { PageTransition, EASE } from "@/components/rub-premium";
import { Spinner } from "@/components/rub-ui";
import {
  displayUrl,
  getStoredUrl,
  setConnected,
  setStoredPlatform,
  type RubPlatform,
} from "@/lib/rub-storage";

const BG = "#080B10";
const GOLD = "#C9A84C";

const CONNECT_PHASES = [
  "Testing connection...",
  "Verifying credentials...",
  "Securing your password...",
] as const;

// ─── Platform option data ─────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "wordpress" as RubPlatform,
    label: "WordPress",
    badge: "FULLY AUTOMATED",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    description: "Automatic connection · Takes 3 minutes",
    available: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 14.4l-2.64-7.23a7.47 7.47 0 0 0 2.64.48v6.75zM12 19.2a7.2 7.2 0 0 1-6.99-5.52l6.99 19.11V19.2zM8.46 8.04l-3.18 9.48A7.2 7.2 0 0 1 8.46 8.04zm7.26 7.53c-.45 1.5-.96 2.04-1.26 2.16l-1.56-4.41 2.82-7.98c.03.18.06.36.06.66 0 2.25-.84 3.93-2.1 5.22.84 2.1 1.41 3.78 2.04 4.35z" />
      </svg>
    ),
  },
  {
    id: "html" as RubPlatform,
    label: "Custom HTML / Other",
    badge: "MANUAL",
    badgeColor: "text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10",
    description: "Download & upload CSS manually · Takes 5 minutes",
    available: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9 text-[#C9A84C]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "shopify" as const,
    label: "Shopify",
    badge: "COMING SOON",
    badgeColor: "text-white/35 border-white/15 bg-white/5",
    description: "Coming soon",
    available: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9 text-white/25" fill="currentColor" aria-hidden>
        <path d="M15.337 23.979l4.826-1.241S18.184 8.436 18.163 8.258c-.023-.176-.176-.293-.314-.293s-2.87-.198-2.87-.198-.814-.861-1.172-1.22v17.432zM12.3 2.498s-.48.138-.66.198c-.215-.648-.628-1.236-1.33-1.236-.02 0-.04.002-.06.003C10.01.924 9.603.66 9.14.66c-3.376 0-4.988 4.217-5.492 6.358-.013.058-.025.116-.037.172l2.894.895C7.1 5.626 8.002 3.95 8.818 3.95c.374 0 .552.36.552.672v.12l-1.766.546C7.37 7.76 7.256 9.688 9.02 10.28c.266.089.618-.052.618-.052L12.3 2.498zM10.92 2.87l-.862.266c.476-1.83 1.368-2.718 2.156-3.042-.384.73-.957 1.876-1.294 2.776zm-.04 8.408l-1.038.322c-.42-.672-.588-2.004-.144-2.928l1.182 2.606zM8.04 5.43l-1.956.604c.44-1.63.978-2.49 1.512-2.49.358 0 .558.58.444 1.886z" />
      </svg>
    ),
  },
  {
    id: "wix" as const,
    label: "Wix / Squarespace",
    badge: "COMING SOON",
    badgeColor: "text-white/35 border-white/15 bg-white/5",
    description: "Coming soon",
    available: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9 text-white/25" fill="currentColor" aria-hidden>
        <path d="M12.086 2C6.477 2 1.924 6.554 1.924 12.163s4.553 10.162 10.162 10.162c5.61 0 10.162-4.553 10.162-10.162S17.695 2 12.086 2zm0 2.162c1.728 0 3.327.523 4.654 1.42l-3.238 3.237a1.877 1.877 0 0 0-.528-.075c-.69 0-1.32.266-1.793.699L7.77 5.63A8.02 8.02 0 0 1 12.086 4.163zm-5.56 2.872l3.42 3.42a2.706 2.706 0 0 0-.4 1.43v.024l-3.443.002a8.012 8.012 0 0 1 .423-4.876zm13.12 5.128h-3.443a2.735 2.735 0 0 0-.402-1.418l3.417-3.42a8.009 8.009 0 0 1 .428 4.838z" />
      </svg>
    ),
  },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

// ─── Platform selection screen ────────────────────────────────────────────────

function PlatformSelect({ onSelect }: { onSelect: (id: "wordpress" | "html") => void }) {
  const [hovered, setHovered] = useState<PlatformId | null>(null);

  return (
    <motion.div
      key="platform-select"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ ease: EASE }}
    >
      <h1 className="rub-font-display mt-8 text-2xl font-bold text-white sm:text-3xl">
        What platform is your website built on?
      </h1>
      <p className="mt-2 text-sm text-white/50">
        This determines how we connect RUB to your site.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const isActive = hovered === p.id && p.available;
          return (
            <motion.button
              key={p.id}
              type="button"
              disabled={!p.available}
              onClick={() => p.available && onSelect(p.id as "wordpress" | "html")}
              onHoverStart={() => p.available && setHovered(p.id)}
              onHoverEnd={() => setHovered(null)}
              whileHover={p.available ? { y: -4, scale: 1.01 } : {}}
              whileTap={p.available ? { scale: 0.99 } : {}}
              transition={{ duration: 0.25, ease: EASE }}
              className={`group relative flex w-full flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6 ${
                p.available
                  ? isActive
                    ? "border-[#C9A84C] bg-[#C9A84C]/8 shadow-[0_0_28px_rgba(201,168,76,0.18)]"
                    : "border-white/[0.10] bg-white/[0.03] hover:border-[#C9A84C]/60"
                  : "cursor-not-allowed border-white/[0.05] bg-white/[0.02] opacity-50"
              }`}
            >
              {/* Badge */}
              <span
                className={`absolute top-3 right-3 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${p.badgeColor}`}
              >
                {p.badge}
              </span>

              {/* Icon */}
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-300 ${
                  p.available
                    ? isActive
                      ? "border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C]"
                      : "border-white/10 bg-white/[0.04] text-white/60 group-hover:border-[#C9A84C]/30 group-hover:text-[#C9A84C]"
                    : "border-white/5 bg-white/[0.02] text-white/20"
                }`}
              >
                {p.icon}
              </span>

              {/* Label + description */}
              <div>
                <p
                  className={`font-semibold transition-colors duration-200 ${
                    p.available
                      ? isActive
                        ? "text-[#C9A84C]"
                        : "text-white group-hover:text-[#C9A84C]"
                      : "text-white/30"
                  }`}
                >
                  {p.label}
                </p>
                <p className={`mt-1 text-xs ${p.available ? "text-white/45" : "text-white/20"}`}>
                  {p.description}
                </p>
              </div>

              {/* Arrow on available */}
              {p.available && (
                <motion.span
                  animate={{ x: isActive ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-4 bottom-4 text-xs font-semibold text-[#C9A84C]/60 group-hover:text-[#C9A84C]"
                >
                  Select →
                </motion.span>
              )}

              {/* Coming soon lock icon */}
              {!p.available && (
                <span className="absolute right-4 bottom-4 text-base text-white/20">🔒</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Custom HTML flow (3 mini-steps) ─────────────────────────────────────────

function HtmlFlow({
  onDone,
  onBack,
}: {
  onDone: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);

  return (
    <motion.div
      key="html-flow"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ease: EASE }}
    >
      <StepDots total={3} current={step} />

      <AnimatePresence mode="wait">
        {/* HTML Step 1 */}
        {step === 1 && (
          <motion.div
            key="h1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ ease: EASE }}
          >
            <p className="text-sm text-[#C9A84C]">Step 1 of 3</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
              Your redesign will be ready soon
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Our 10 AI agents will analyse your website and generate a complete new
              CSS file specifically tailored to your business.
            </p>

            <div className="mt-8 space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              {[
                { icon: "🤖", text: "AI agents analyse your current site" },
                { icon: "🎨", text: "New design system is created" },
                { icon: "📄", text: "CSS file is generated for your site" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-white/35">
              No code knowledge needed. We will guide you through every step.
            </p>

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton onClick={() => setStep(2)}>
                I understand →
              </GoldPrimaryButton>
              <button
                type="button"
                onClick={onBack}
                className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C]"
              >
                ← Change platform
              </button>
            </div>
          </motion.div>
        )}

        {/* HTML Step 2 */}
        {step === 2 && (
          <motion.div
            key="h2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ ease: EASE }}
          >
            <p className="text-sm text-[#C9A84C]">Step 2 of 3</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
              Download your new CSS file
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Once the redesign is complete, you will receive a single CSS file.
              Download it to your computer — it is everything your new design needs.
            </p>

            <div className="mt-8 rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-6 text-center">
              <span className="text-5xl">📥</span>
              <p className="mt-3 text-sm font-medium text-white">
                rub-redesign-yoursite.css
              </p>
              <p className="mt-1 text-xs text-white/40">
                ~12 KB · Contains your complete new design
              </p>
              <div className="mx-auto mt-4 h-2 w-32 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-[#C9A84C]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton onClick={() => setStep(3)}>
                Got it →
              </GoldPrimaryButton>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C]"
              >
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* HTML Step 3 */}
        {step === 3 && (
          <motion.div
            key="h3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ ease: EASE }}
          >
            <p className="text-sm text-[#C9A84C]">Step 3 of 3</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
              Upload the file to your website
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Using your web host&apos;s file manager, upload the CSS file to your
              website&apos;s root folder. Then link it in your HTML{" "}
              <span className="font-mono text-[#C9A84C]">&lt;head&gt;</span>.
            </p>

            {/* Video tutorial placeholder */}
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1117]">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#0D1117] to-[#1a1f26]">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className="mx-auto flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-[#C9A84C] bg-[#C9A84C]/10"
                  >
                    <span className="ml-1 text-2xl text-[#C9A84C]">▶</span>
                  </motion.div>
                  <p className="mt-3 text-sm font-medium text-white/60">
                    Watch: Upload tutorial (2 min)
                  </p>
                  <p className="mt-1 text-xs text-white/30">Video coming soon</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="flex items-start gap-2 text-xs text-white/55">
                <span className="shrink-0 text-base">💡</span>
                <span>
                  Need help? Our support team can walk you through the upload process
                  step by step. Just send us a message after your analysis is complete.
                </span>
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton onClick={onDone}>
                Continue to analysis →
              </GoldPrimaryButton>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C]"
              >
                Go back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── WordPress flow (4 step guide + API connection) ──────────────────────────

function WordPressFlow({
  domain,
  siteUrl,
  onSuccess,
  onBack,
}: {
  domain: string;
  siteUrl: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectPhase, setConnectPhase] = useState(0);
  const [connectMsg, setConnectMsg] = useState("");
  const [error, setError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const runPhaseMessages = async () => {
    for (let i = 0; i < CONNECT_PHASES.length; i++) {
      setConnectPhase(i);
      setConnectMsg(CONNECT_PHASES[i]);
      await new Promise((r) => setTimeout(r, 1200));
    }
  };

  const connect = async () => {
    setError("");
    if (!username.trim()) { setError("Please enter your WordPress username."); return; }
    if (!password.trim()) { setError("Please enter your Application Password."); return; }

    setConnecting(true);
    setConnectPhase(0);
    setConnectMsg(CONNECT_PHASES[0]);

    const phasePromise = runPhaseMessages();

    let apiResult: { success: boolean; error?: string } | null = null;
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: siteUrl || `https://${domain}`,
          username: username.trim(),
          password: password.trim(),
        }),
      });
      apiResult = (await res.json()) as typeof apiResult;
    } catch {
      apiResult = { success: false, error: "Could not reach the server. Please check your internet connection." };
    }

    await phasePromise;
    setConnecting(false);

    if (!apiResult?.success) {
      setError(apiResult?.error ?? "Connection failed. Please check your details and try again.");
      return;
    }

    onSuccess();
  };

  return (
    <motion.div
      key="wp-flow"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ease: EASE }}
    >
      <StepDots total={4} current={step} />

      <AnimatePresence mode="wait">
        {/* WP Step 1 — Log into WP Admin */}
        {step === 1 && (
          <motion.div key="w1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE }}>
            <p className="text-sm text-[#C9A84C]">Step 1 of 4</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
              Connect your WordPress site
            </h2>
            <p className="mt-3 text-white/50">This takes 3 minutes. We guide you through every click.</p>

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#1a1f26] p-8 text-center">
              <span className="text-5xl">📝</span>
              <p className="mt-4 text-sm font-medium text-white/70">WordPress dashboard</p>
              <div className="mx-auto mt-4 max-w-xs space-y-2 opacity-60">
                <div className="h-3 rounded bg-white/10" />
                <div className="h-20 rounded bg-white/5" />
              </div>
            </div>

            <p className="mt-6 text-sm text-white/55">First, log into your WordPress admin dashboard.</p>
            <p className="mt-2 text-sm text-white/40">
              Usually at: <span className="font-mono text-[#C9A84C]">{domain}/wp-admin</span>
            </p>

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton onClick={() => setStep(2)}>I am logged in →</GoldPrimaryButton>
              <OutlineButton onClick={() => setHelpOpen(!helpOpen)}>I need help</OutlineButton>
              <AnimatePresence>
                {helpOpen && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-3 text-xs text-white/60">
                    Open a new tab, go to {domain}/wp-admin, and sign in with your WordPress username and password.
                  </motion.p>
                )}
              </AnimatePresence>
              <button type="button" onClick={onBack} className="w-full text-center text-sm text-white/35 hover:text-[#C9A84C]">
                ← Change platform
              </button>
            </div>
          </motion.div>
        )}

        {/* WP Step 2 — Go to Profile */}
        {step === 2 && (
          <motion.div key="w2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE }}>
            <p className="text-sm text-[#C9A84C]">Step 2 of 4</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">Go to your Profile</h2>
            <p className="mt-3 text-sm text-white/55">Click your name in the top right corner, then click Edit Profile.</p>

            <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1f26] p-6">
              <div className="flex justify-end">
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  Click here →
                </motion.span>
              </div>
              <div className="mt-4 h-32 rounded bg-white/5" />
            </div>

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton onClick={() => setStep(3)}>I found my profile →</GoldPrimaryButton>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C]">Go back</button>
            </div>
          </motion.div>
        )}

        {/* WP Step 3 — Create Application Password */}
        {step === 3 && (
          <motion.div key="w3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE }}>
            <p className="text-sm text-[#C9A84C]">Step 3 of 4</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">Create an Application Password</h2>
            <p className="mt-3 text-sm text-white/55">
              Scroll down to <span className="font-semibold text-white">Application Passwords</span>. Type{" "}
              <span className="font-mono text-[#C9A84C]">RUB</span> in the name box, then click{" "}
              <span className="font-semibold text-white">Add New Application Password</span>.
            </p>

            <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1f26] p-6">
              <motion.div className="absolute right-6 bottom-16 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                ↓ This section
              </motion.div>
              <p className="text-xs text-white/40">Application Passwords</p>
              <div className="mt-3 h-10 rounded border border-white/10 bg-black/20" />
            </div>

            <p className="mt-5 text-sm text-white/45">WordPress will show you a long password — copy it, you&apos;ll need it in the next step.</p>

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton onClick={() => setStep(4)}>I have my password →</GoldPrimaryButton>
              <button type="button" onClick={() => setStep(2)} className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C]">Go back</button>
            </div>
          </motion.div>
        )}

        {/* WP Step 4 — Enter credentials */}
        {step === 4 && (
          <motion.div key="w4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ ease: EASE }}>
            <p className="text-sm text-[#C9A84C]">Step 4 of 4</p>
            <h2 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">Enter your credentials</h2>
            <p className="mt-3 text-sm text-white/55">Enter your WordPress admin username and the Application Password you just created.</p>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/35">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="Your WordPress username"
                  autoComplete="username"
                  className="rub-input w-full rounded-xl py-4 pr-4 pl-11 text-white placeholder:text-white/25"
                />
              </div>
              <p className="text-xs text-white/35">
                The username you use to log into <span className="font-mono text-white/50">{domain}/wp-admin</span>
              </p>

              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/35">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="xxxx xxxx xxxx xxxx xxxx"
                  autoComplete="new-password"
                  className="rub-input w-full rounded-xl py-4 pr-12 pl-11 font-mono text-white placeholder:text-white/25"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 hover:text-white/70" aria-label={showPass ? "Hide password" : "Show password"}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              <p className="text-xs text-white/35">Application Password from WordPress — looks like <span className="font-mono">xxxx xxxx xxxx</span></p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm leading-relaxed text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 rounded-xl border-l-4 border-[#C9A84C] bg-white/[0.03] p-4">
              <p className="flex items-start gap-2 text-sm text-white/60">
                <span>🔒</span>
                <span>Your password is AES-256 encrypted instantly. Even RUB staff cannot see it. Revoke anytime from WordPress.</span>
              </p>
            </div>

            {connecting && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-2">
                {CONNECT_PHASES.map((phase, i) => (
                  <div key={phase} className="flex items-center gap-2 text-xs">
                    <span className={i < connectPhase ? "text-emerald-400" : i === connectPhase ? "text-[#C9A84C]" : "text-white/20"}>
                      {i < connectPhase ? "✅" : i === connectPhase ? "⏳" : "○"}
                    </span>
                    <span className={i < connectPhase ? "text-emerald-400" : i === connectPhase ? "text-white" : "text-white/20"}>
                      {phase}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="mt-8 space-y-3">
              <GoldPrimaryButton loading={connecting} onClick={connect}>
                {connecting ? <><Spinner /> {connectMsg}</> : "Connect My Website Securely →"}
              </GoldPrimaryButton>
              <button type="button" onClick={() => setStep(3)} disabled={connecting} className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C] disabled:opacity-40">
                Go back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("yourwebsite.com");
  const [siteUrl, setSiteUrl] = useState("");
  const [phase, setPhase] = useState<"select" | "wordpress" | "html">("select");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const url = getStoredUrl();
    if (url) {
      setSiteUrl(url);
      setDomain(displayUrl(url));
    }
  }, []);

  const handlePlatformSelect = (id: "wordpress" | "html") => {
    setStoredPlatform(id);
    setPhase(id);
  };

  const handleDone = () => {
    setConnected(true);
    setSuccess(true);
    setTimeout(() => router.push("/analyze"), 2000);
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen text-white" style={{ backgroundColor: BG }}>
        <AuthBackground />
        <FlowProgressBar currentStep={3} />

        <div className="relative z-10 mx-auto max-w-xl px-4 py-10 sm:py-14">
          <Link href="/" className="rub-font-display text-xl font-bold text-[#C9A84C]">
            RUB
          </Link>

          <AnimatePresence mode="wait">
            {phase === "select" && (
              <PlatformSelect key="select" onSelect={handlePlatformSelect} />
            )}

            {phase === "wordpress" && (
              <WordPressFlow
                key="wp"
                domain={domain}
                siteUrl={siteUrl}
                onSuccess={handleDone}
                onBack={() => setPhase("select")}
              />
            )}

            {phase === "html" && (
              <HtmlFlow
                key="html"
                onDone={handleDone}
                onBack={() => setPhase("select")}
              />
            )}
          </AnimatePresence>

          {/* Skip option only on platform select screen */}
          {phase === "select" && (
            <p className="mt-10 text-center text-sm text-white/35">
              <button
                type="button"
                onClick={() => {
                  setConnected(true);
                  router.push("/analyze");
                }}
                className="font-medium text-[#C9A84C] hover:underline"
              >
                Skip for now →
              </button>
            </p>
          )}
        </div>

        {success && (
          <SuccessOverlay
            title="Connected! ✅"
            subtitle={`${domain} is now securely connected to RUB`}
            onDone={() => router.push("/analyze")}
          />
        )}
      </div>
    </PageTransition>
  );
}
