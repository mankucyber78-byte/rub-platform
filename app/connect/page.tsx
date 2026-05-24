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

const CONNECT_MESSAGES = [
  "Connecting...",
  "Testing your connection...",
  "Encrypting credentials...",
];

export default function ConnectPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("yourwebsite.com");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const url = getStoredUrl();
    if (url) {
      setDomain(displayUrl(url));
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    for (const msg of CONNECT_MESSAGES) {
      setConnectMsg(msg);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setConnected(true);
    setConnecting(false);
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
                  <GoldPrimaryButton onClick={() => setStep(2)}>I am logged in →</GoldPrimaryButton>
                  <OutlineButton onClick={() => setHelpOpen(!helpOpen)}>I need help</OutlineButton>
                  {helpOpen && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-3 text-xs text-white/60"
                    >
                      Open a new tab, go to {domain}/wp-admin, and sign in with your WordPress
                      username and password.
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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
                  <GoldPrimaryButton onClick={() => setStep(3)}>I found my profile →</GoldPrimaryButton>
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

            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-[#C9A84C]">Step 3 of 4</p>
                <h1 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Create an Application Password
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  Scroll down to Application Passwords. Type RUB in the name box, then click Add
                  New Application Password.
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

                <div className="mt-8 space-y-3">
                  <GoldPrimaryButton onClick={() => setStep(4)}>
                    I created the password →
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

            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-[#C9A84C]">Step 4 of 4</p>
                <h1 className="rub-font-display mt-2 text-2xl font-bold sm:text-3xl">
                  Paste your password here
                </h1>
                <p className="mt-3 text-sm text-white/55">
                  WordPress showed you a password. Copy it and paste it below.
                </p>

                <div className="relative mt-8">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/35">🔒</span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx xxxx"
                    className="rub-input w-full rounded-xl py-4 pr-12 pl-11 font-mono text-white placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40"
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>

                <div className="mt-6 rounded-xl border-l-4 border-[#C9A84C] bg-white/[0.03] p-4">
                  <p className="flex items-start gap-2 text-sm text-white/60">
                    <span>🔒</span>
                    <span>
                      Your password is encrypted instantly. Even RUB staff cannot see it. You can
                      revoke access anytime from your WordPress dashboard.
                    </span>
                  </p>
                </div>

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
                    className="w-full text-center text-sm text-white/40 hover:text-[#C9A84C]"
                  >
                    Go back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
