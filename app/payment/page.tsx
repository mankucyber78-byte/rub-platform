"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@/components/rub-ui";
import {
  GlassCard,
  GoldConfetti,
  PageTransition,
  PremiumProgressBar,
  TrustBadge,
  SkeletonPage,
} from "@/components/rub-premium";
import { displayUrl, getStoredUrl } from "@/lib/rub-storage";

const DARK = "#0D1117";
const GOLD = "#C9A84C";

const INCLUDED = [
  "Full AI redesign published live",
  "10 photos enhanced and placed",
  "5 videos optimized and placed",
  "SEO improvements applied",
  "30 day rollback guarantee",
  "Switch old/new anytime forever",
  "Backend never touched",
  "Forms and payments still work",
  "24/7 health monitoring",
  "Emergency restore anytime",
];

const TRUST_BADGES = [
  { icon: "🔒", label: "Secure Payment" },
  { icon: "✅", label: "30 Day Guarantee" },
  { icon: "🔄", label: "Switch Back Anytime" },
  { icon: "🛡️", label: "Backend Never Touched" },
];

type DeployStep = {
  id: string;
  label: string;
  status: "done" | "active" | "pending";
};

function PaymentForm({
  website,
  onPay,
  paying,
}: {
  website: string;
  onPay: () => void;
  paying: boolean;
}) {
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-14">
      {/* ORDER SUMMARY */}
      <div className="lg:pr-4">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          You are almost live! 🚀
        </h1>
        <p className="mt-2 text-sm text-white/50 sm:text-base">
          One final step to publish your new website
        </p>

        <GlassCard gold className="mt-8 p-5 sm:p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-white/50">Website</span>
              <span className="font-medium text-white">{website}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <span className="text-white/50">Plan</span>
              <span className="font-medium text-white">One Time Redesign</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Price</span>
              <span className="text-xl font-bold text-[#C9A84C]">$49.99</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#C9A84C]/90">
            30 day money back guarantee
          </p>
        </GlassCard>

        <div className="mt-8">
          <p className="text-sm font-semibold text-white">What is included</p>
          <ul className="mt-4 space-y-2">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-white/70"
              >
                <span className="text-[#C9A84C]">✅</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {TRUST_BADGES.map((b) => (
            <TrustBadge key={b.label}>
              {b.icon} {b.label}
            </TrustBadge>
          ))}
        </div>
      </div>

      {/* PAYMENT FORM */}
      <div className="mt-12 lg:mt-0">
        <GlassCard className="p-5 sm:p-8">
          <h2 className="text-xl font-bold text-white">Payment Details</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/70"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="rub-input mt-2 w-full"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white/70">
                Card Information
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="rub-input mt-2 w-full"
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="rub-input w-full"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="CVC"
                  className="rub-input w-full"
                />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cardholder name"
                className="rub-input mt-3 w-full"
              />
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-white/45 sm:text-sm">
            Your card will be charged $49.99 one time. No subscriptions. No
            hidden fees. Ever.
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPay}
            disabled={paying}
            className="rub-btn-gold mt-6 flex w-full items-center justify-center gap-2 sm:text-lg"
          >
            {paying && <Spinner />}
            {paying ? "Processing..." : "🚀 Pay $49.99 and Publish Now"}
          </motion.button>

          <div className="mt-5 rounded-xl border border-[#C9A84C]/20 border-l-4 border-l-[#C9A84C] bg-[rgba(201,168,76,0.06)] px-5 py-4">
            <p className="flex items-start gap-3 text-left text-sm leading-relaxed text-white/70">
              <motion.span
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 text-xl"
                aria-hidden
              >
                ❤️
              </motion.span>
              <span>
                7% of this payment goes to old age homes, orphanages and children&apos;s
                education. Automatically. Every order.
              </span>
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPay}
              disabled={paying}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black/90 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple Pay
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPay}
              disabled={paying}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white py-3.5 text-sm font-semibold text-[#3C4043] shadow-lg transition-colors hover:bg-white/95 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Pay
            </motion.button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-white/40">
            🔒 256-bit SSL encryption
            <br />
            Powered by Stripe — the world&apos;s most trusted payment platform
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

function SuccessFlow({
  website,
  onComplete,
}: {
  website: string;
  onComplete: () => void;
}) {
  const [publishProgress, setPublishProgress] = useState(0);
  const [steps, setSteps] = useState<DeployStep[]>([
    { id: "pay", label: "Payment confirmed", status: "done" },
    { id: "backup", label: "Old design backed up to secure servers", status: "pending" },
    { id: "css", label: "New CSS being pushed to your website...", status: "pending" },
    { id: "health", label: "Health check running...", status: "pending" },
    { id: "live", label: "Going live...", status: "pending" },
  ]);
  const [phase, setPhase] = useState<"publishing" | "live">("publishing");

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setPublishProgress((p) => Math.min(p + 1, 100));
    }, 55);

    const setStepState = (doneIds: string[], activeId: string | null) => {
      setSteps((s) =>
        s.map((x) => {
          if (x.id === "pay" || doneIds.includes(x.id))
            return { ...x, status: "done" };
          if (x.id === activeId) return { ...x, status: "active" };
          return { ...x, status: "pending" };
        })
      );
    };

    const t0 = setTimeout(() => setStepState([], "backup"), 100);
    const t1 = setTimeout(() => setStepState(["backup"], "css"), 2000);
    const t2 = setTimeout(() => setStepState(["backup", "css"], "health"), 4000);
    const t3 = setTimeout(() => setStepState(["backup", "css", "health"], "live"), 6000);
    const t4 = setTimeout(() => {
      setStepState(["backup", "css", "health", "live"], null);
      setPhase("live");
      setPublishProgress(100);
      clearInterval(progressInterval);
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    if (phase !== "live") return;
    const timer = setTimeout(() => onComplete(), 2000);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0D1117]/98 px-4 py-10 backdrop-blur-sm">
      <GoldConfetti active />

      <GlassCard gold className="relative z-10 w-full max-w-lg p-8 text-center sm:p-10">
        <AnimatePresence mode="wait">
          {phase === "publishing" ? (
            <motion.div
              key="publishing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#C9A84C] text-4xl font-bold text-[#0D1117]"
              >
                ✓
              </motion.div>

              <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
                Payment Successful! 🎉
              </h2>
              <p className="mt-2 text-sm text-white/50 sm:text-base">
                Publishing your new website now...
              </p>

              <PremiumProgressBar value={publishProgress} className="mt-8" />
              <p className="mt-2 text-xs text-white/40">
                This takes about 60 seconds
              </p>

              <ul className="mt-8 space-y-3 text-left text-sm">
                {steps.map((step) => (
                  <li key={step.id} className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-center">
                      {step.status === "done" ? (
                        <span className="text-emerald-400">✅</span>
                      ) : step.status === "active" ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="inline-block text-[#C9A84C]"
                        >
                          ⏳
                        </motion.span>
                      ) : (
                        <span className="text-white/25">○</span>
                      )}
                    </span>
                    <span
                      className={
                        step.status === "pending"
                          ? "text-white/35"
                          : step.status === "active"
                            ? "text-[#C9A84C]"
                            : "text-white/80"
                      }
                    >
                      {step.label}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <h2 className="mt-4 text-2xl font-bold text-[#C9A84C] sm:text-3xl">
                Your website is LIVE!
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                And you just made a difference. 7% of your payment is already on its way
                to someone who needs it most. Thank you ❤️
              </p>
              <p className="mt-4 text-sm text-white/50">Visit:</p>
              <p className="mt-1 text-lg font-semibold text-white">{website}</p>
              <p className="mt-6 text-sm text-[#C9A84C]">
                Redirecting to your dashboard...
              </p>
              <button
                type="button"
                onClick={onComplete}
                className="mt-4 w-full rounded-xl border border-[#C9A84C]/40 bg-transparent px-6 py-3 text-sm font-semibold text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
              >
                Go to My Dashboard →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}

function PaymentContent() {
  const router = useRouter();
  const [website, setWebsite] = useState("myrestaurant.com");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setWebsite(displayUrl(getStoredUrl()));
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setPaid(true);
    } catch {
      setPaying(false);
    }
  };

  return (
    <PageTransition>
    <div
      className="min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: DARK }}
    >
      <AnimatePresence>
        {paid && (
          <SuccessFlow
            website={website}
            onComplete={() => router.push("/dashboard")}
          />
        )}
      </AnimatePresence>

      <header className="border-b border-white/5 px-4 py-4 sm:px-6">
        <a href="/" className="text-xl font-bold text-[#C9A84C]">
          RUB
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <PaymentForm website={website} onPay={handlePay} paying={paying} />
      </main>
    </div>
    </PageTransition>
  );
}

function PaymentFallback() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: DARK }}
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <SkeletonPage />
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentContent />
    </Suspense>
  );
}
