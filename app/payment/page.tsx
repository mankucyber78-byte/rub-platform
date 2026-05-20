"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@/components/rub-ui";
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

const CONFETTI = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 3) % 100}%`,
  delay: (i % 12) * 0.08,
  size: 6 + (i % 5),
  color: i % 3 === 0 ? "#C9A84C" : i % 3 === 1 ? "#e8c96a" : "#f5e6b8",
  rotate: (i * 47) % 360,
}));

function GoldConfetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {CONFETTI.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-sm"
          style={{
            left: c.left,
            top: "-5%",
            width: c.size,
            height: c.size * 1.4,
            backgroundColor: c.color,
            rotate: c.rotate,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: ["0vh", "110vh"],
            opacity: [1, 1, 0],
            rotate: c.rotate + 360,
          }}
          transition={{
            duration: 2.5 + (c.id % 4) * 0.5,
            delay: c.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

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

        <div className="mt-8 rounded-2xl border border-[#C9A84C]/25 bg-white/[0.04] p-5 sm:p-6">
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
              <span className="text-xl font-bold text-[#C9A84C]">$39.00</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#C9A84C]/90">
            30 day money back guarantee
          </p>
        </div>

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
            <span
              key={b.label}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60"
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* PAYMENT FORM */}
      <div className="mt-12 lg:mt-0">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
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
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
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
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="CVC"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
                />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cardholder name"
                className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/25"
              />
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-white/45 sm:text-sm">
            Your card will be charged $39.00 one time. No subscriptions. No
            hidden fees. Ever.
          </p>

          <button
            type="button"
            onClick={onPay}
            disabled={paying}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-6 py-4 text-base font-bold text-[#0D1117] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 sm:text-lg"
          >
            {paying && <Spinner />}
            {paying ? "Processing..." : "🚀 Pay $39 and Publish Now"}
          </button>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onPay}
              disabled={paying}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
            >
              <span className="text-lg"></span>
              Pay with Apple Pay
            </button>
            <button
              type="button"
              onClick={onPay}
              disabled={paying}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white py-3 text-sm font-semibold text-[#4285F4] transition-colors hover:bg-white/90 disabled:opacity-50"
            >
              <span className="font-bold text-[#4285F4]">G</span>
              Pay with Google Pay
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-white/40">
            🔒 256-bit SSL encryption
            <br />
            Powered by Stripe — the world&apos;s most trusted payment platform
          </p>
        </div>
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
      <GoldConfetti />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-[#C9A84C]/30 bg-[#0D1117] p-8 text-center shadow-[0_0_60px_rgba(201,168,76,0.2)] sm:p-10"
      >
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

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#e8c96a]"
                  style={{ width: `${publishProgress}%` }}
                />
              </div>
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
      </motion.div>
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
  );
}

function PaymentFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center text-white/40"
      style={{ backgroundColor: DARK }}
    >
      Loading...
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
