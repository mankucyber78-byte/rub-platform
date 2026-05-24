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
} from "@/lib/rub-storage";

const BG = "#080B10";

const CONNECT_PHASES = [
  "Testing connection...",
  "Verifying credentials...",
  "Securing your password...",
] as const;

export default function ConnectPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("yourwebsite.com");
  const [siteUrl, setSiteUrl] = useState("");
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectPhase, setConnectPhase] = useState(0);
  const [connectMsg, setConnectMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const url = getStoredUrl();
    if (url) {
      setSiteUrl(url);
      setDomain(displayUrl(url));
    }
  }, []);

  // Advance through the loading phases shown while the API call runs
  const runPhaseMessages = async () => {
    for (let i = 0; i < CONNECT_PHASES.length; i++) {
      setConnectPhase(i);
      setConnectMsg(CONNECT_PHASES[i]);
      // Hold each phase message for ~1.2 s so the user can read it
      await new Promise((r) => setTimeout(r, 1200));
    }
  };

  const connect = async () => {
    setError("");

    if (!username.trim()) {
      setError("Please enter your WordPress username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your Application Password.");
      return;
    }

    setConnecting(true);
    setConnectPhase(0);
    setConnectMsg(CONNECT_PHASES[0]);

    // Run phase messages in parallel with the real API call
    const phasePromise = runPhaseMessages();

    let apiResult: { success: boolean; error?: string; websiteTitle?: string } | null =
      null;

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
      // Network error — treat as connection failure
      apiResult = {
        success: false,
        error: "Could not reach the server. Please check your internet connection.",
      };
    }

    // Wait for phase messages to finish (at least show them all)
    await phasePromise;

    setConnecting(false);

    if (!apiResult?.success) {
      setError(
        apiResult?.error ?? "Connection failed. Please check your details and try again."
      );
      return;
    }

    // Mark connected in localStorage so /analyze guard passes
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

          <StepDots total={4} current={step} />

          <AnimatePresence mode="wait">
            {/* ── Step 1 — Log into WP Admin ── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ ease: EASE }}
              >
                <p className="text-sm text-[#C9A84C]">Step 1 of 4</p>
                <h1 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Connect your WordPress site
                </h1>
                <p className="mt-3 text-white/50">
                  This takes 3 minutes. We guide you through every click.
                </p>

                <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#1a1f26] p-8 text-center">
                  <span className="text-5xl">📝</span>
                  <p className="mt-4 text-sm font-medium text-white/70">WordPress dashboard</p>
                  <div className="mx-auto mt-4 max-w-xs space-y-2 opacity-60">
                    <div className="h-3 rounded bg-white/10" />
                    <div className="h-20 rounded bg-white/5" />
                  </div>
                </div>

                <p className="mt-6 text-sm text-white/55">
                  First, log into your WordPress admin dashboard.
                </p>
                <p className="mt-2 text-sm text-white/40">
                  Usually at:{" "}
                  <span className="font-mono text-[#C9A84C]">{domain}/wp-admin</span>
                </p>

                <div className="relative mt-8 space-y-3">
                  <GoldPrimaryButton onClick={() => setStep(2)}>
                    I am logged in →
                  </GoldPrimaryButton>
                  <OutlineButton onClick={() => setHelpOpen(!helpOpen)}>
                    I need help
                  </OutlineButton>
                  {helpOpen && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-3 text-xs text-white/60"
                    >
                      Open a new tab, go to {domain}/wp-admin, and sign in with your
                      WordPress username and password.
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 2 — Go to Profile ── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ ease: EASE }}
              >
                <p className="text-sm text-[#C9A84C]">Step 2 of 4</p>
                <h1 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Go to your Profile
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  Click your name in the top right corner, then click Edit Profile.
                </p>

                <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1f26] p-6">
                  <div className="flex justify-end">
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white"
                    >
                      Click here →
                    </motion.span>
                  </div>
                  <div className="mt-4 h-32 rounded bg-white/5" />
                </div>

                <div className="mt-8 space-y-3">
                  <GoldPrimaryButton onClick={() => setStep(3)}>
                    I found my profile →
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

            {/* ── Step 3 — Create Application Password ── */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ ease: EASE }}
              >
                <p className="text-sm text-[#C9A84C]">Step 3 of 4</p>
                <h1 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Create an Application Password
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  Scroll down to{" "}
                  <span className="font-semibold text-white">Application Passwords</span>.
                  Type <span className="font-mono text-[#C9A84C]">RUB</span> in the name
                  box, then click{" "}
                  <span className="font-semibold text-white">
                    Add New Application Password
                  </span>
                  .
                </p>

                <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1f26] p-6">
                  <motion.div
                    className="absolute right-6 bottom-16 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    ↓ This section
                  </motion.div>
                  <p className="text-xs text-white/40">Application Passwords</p>
                  <div className="mt-3 h-10 rounded border border-white/10 bg-black/20" />
                </div>

                <p className="mt-5 text-sm text-white/45">
                  WordPress will show you a long password — copy it, you&apos;ll need it
                  in the next step.
                </p>

                <div className="mt-8 space-y-3">
                  <GoldPrimaryButton onClick={() => setStep(4)}>
                    I have my password →
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

            {/* ── Step 4 — Enter credentials ── */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ ease: EASE }}
              >
                <p className="text-sm text-[#C9A84C]">Step 4 of 4</p>
                <h1 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Enter your credentials
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  Enter your WordPress admin username and the Application Password you
                  just created.
                </p>

                <div className="mt-8 space-y-4">
                  {/* Username */}
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/35">
                      👤
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
                      }}
                      placeholder="Your WordPress username"
                      autoComplete="username"
                      className="rub-input w-full rounded-xl py-4 pr-4 pl-11 text-white placeholder:text-white/25"
                    />
                  </div>
                  <p className="text-xs text-white/35">
                    This is the username you use to log into{" "}
                    <span className="font-mono text-white/50">{domain}/wp-admin</span>
                  </p>

                  {/* Application Password */}
                  <div className="relative mt-2">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/35">
                      🔒
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="xxxx xxxx xxxx xxxx xxxx"
                      autoComplete="new-password"
                      className="rub-input w-full rounded-xl py-4 pr-12 pl-11 font-mono text-white placeholder:text-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 hover:text-white/70"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                  <p className="text-xs text-white/35">
                    The Application Password from WordPress — looks like{" "}
                    <span className="font-mono">xxxx xxxx xxxx xxxx xxxx</span>
                  </p>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
                    >
                      <p className="text-sm leading-relaxed text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Security note */}
                <div className="mt-6 rounded-xl border-l-4 border-[#C9A84C] bg-white/[0.03] p-4">
                  <p className="flex items-start gap-2 text-sm text-white/60">
                    <span>🔒</span>
                    <span>
                      Your password is AES-256 encrypted instantly. Even RUB staff cannot
                      see it. You can revoke access anytime from your WordPress dashboard.
                    </span>
                  </p>
                </div>

                {/* Loading phases indicator */}
                {connecting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 space-y-2"
                  >
                    {CONNECT_PHASES.map((phase, i) => (
                      <div key={phase} className="flex items-center gap-2 text-xs">
                        <span
                          className={
                            i < connectPhase
                              ? "text-emerald-400"
                              : i === connectPhase
                                ? "text-[#C9A84C]"
                                : "text-white/20"
                          }
                        >
                          {i < connectPhase ? "✅" : i === connectPhase ? "⏳" : "○"}
                        </span>
                        <span
                          className={
                            i < connectPhase
                              ? "text-emerald-400"
                              : i === connectPhase
                                ? "text-white"
                                : "text-white/20"
                          }
                        >
                          {phase}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                <div className="mt-8 space-y-3">
                  <GoldPrimaryButton loading={connecting} onClick={connect}>
                    {connecting ? (
                      <>
                        <Spinner /> {connectMsg}
                      </>
                    ) : (
                      "Connect My Website Securely →"
                    )}
                  </GoldPrimaryButton>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={connecting}
                    className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C] disabled:opacity-40"
                  >
                    Go back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip option */}
          <p className="mt-12 text-center text-sm text-white/40">
            Not using WordPress?{" "}
            <button
              type="button"
              onClick={() => {
                setConnected(true);
                router.push("/analyze");
              }}
              className="font-medium text-[#C9A84C] hover:underline"
            >
              Continue without connecting →
            </button>
          </p>
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
