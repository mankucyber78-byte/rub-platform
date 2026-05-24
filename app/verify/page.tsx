"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AuthBackground,
  FlowProgressBar,
  GoldPrimaryButton,
  OutlineButton,
  SuccessOverlay,
} from "@/components/rub-auth-ui";
import { PageTransition } from "@/components/rub-premium";
import {
  displayUrl,
  emailMatchesWebsite,
  getStoredUrl,
  getStoredUser,
  setVerified,
} from "@/lib/rub-storage";

const BG = "#080B10";

export default function VerifyPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("yourwebsite.com");
  const [email, setEmail] = useState("");
  const [emailMatch, setEmailMatch] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const url = getStoredUrl();
    const user = getStoredUser();
    if (url) {
      setDomain(displayUrl(url));
    }
    if (user) {
      setEmail(user.email);
      if (url) {
        setEmailMatch(emailMatchesWebsite(user.email, url));
      }
    }
  }, []);

  const completeVerification = () => {
    setVerified(true);
    setSuccess(true);
    setTimeout(() => router.push("/connect"), 2000);
  };

  const handleFileCheck = async () => {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 1500));
    setChecking(false);
    completeVerification();
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen text-white" style={{ backgroundColor: BG }}>
        <AuthBackground />
        <FlowProgressBar currentStep={2} />

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 sm:py-14">
          <Link href="/" className="rub-font-display text-xl font-bold text-[#C9A84C]">
            RUB
          </Link>

          <h1 className="rub-font-display mt-8 text-3xl font-bold text-white sm:text-4xl">
            Verify you own this website
          </h1>
          <p className="mt-3 text-white/55">
            We need to confirm{" "}
            <span className="font-semibold text-[#C9A84C]">{domain}</span> belongs to you
          </p>

          <div className="mt-10 space-y-5">
            {/* Card 1 — Email */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl border-2 border-[#C9A84C]/50 bg-white/[0.03] p-6 shadow-[0_0_32px_rgba(201,168,76,0.12)]"
            >
              <span className="absolute -top-3 right-4 rounded-full bg-[#C9A84C] px-3 py-0.5 text-[10px] font-bold text-[#080B10] uppercase">
                Recommended
              </span>
              <div className="flex gap-4">
                <span className="text-3xl">✉️</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">Instant Email Verification</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    If you signed up with your business email — the same as your website domain
                    — you are already verified instantly.
                  </p>
                  <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 font-mono text-xs text-white/60">
                    {email || "you@example.com"} ↔ {domain}
                  </p>
                  {emailMatch && (
                    <motion.p
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-400"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                        ✓
                      </span>
                      Email matches your website domain
                    </motion.p>
                  )}
                  <div className="mt-5">
                    <GoldPrimaryButton onClick={completeVerification}>
                      I am verified! Continue →
                    </GoldPrimaryButton>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 — File */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
            >
              <div className="flex gap-4">
                <span className="text-3xl">📁</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">Upload Verification File</h2>
                  <p className="mt-2 text-sm text-white/50">
                    Download a small file and upload it to your website. Takes about 3 minutes.
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <OutlineButton>Download File</OutlineButton>
                    <GoldPrimaryButton loading={checking} onClick={handleFileCheck}>
                      I uploaded it — Check Now
                    </GoldPrimaryButton>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3 — Google */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
            >
              <div className="flex gap-4">
                <span className="text-3xl">🔍</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">Verify with Google</h2>
                  <p className="mt-2 text-sm text-white/50">
                    Use Google Search Console if you already have it set up.
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    onClick={completeVerification}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#4285F4] shadow-md sm:w-auto"
                  >
                    Verify with Google
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <p className="mt-10 text-center text-sm">
            <button type="button" className="text-[#C9A84C] hover:underline">
              Need help? Chat with us →
            </button>
          </p>
        </div>

        {success && (
          <SuccessOverlay
            title="Verified! ✅"
            subtitle={`${domain} is confirmed as yours`}
            onDone={() => router.push("/connect")}
          />
        )}
      </div>
    </PageTransition>
  );
}
