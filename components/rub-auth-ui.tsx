"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldParticles, PageTransition, EASE } from "@/components/rub-premium";
import { Spinner } from "@/components/rub-ui";

const BG = "#080B10";
const GOLD = "#C9A84C";

export const FLOW_STEPS = [
  "Account",
  "Verify",
  "Connect",
  "Analyze",
  "Results",
  "Live",
] as const;

export function AuthBackground() {
  return (
    <>
      <div className="rub-radial-glow pointer-events-none absolute inset-0" />
      <GoldParticles />
    </>
  );
}

export function FlowProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="border-b border-white/[0.06] bg-[#080B10]/90 px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-3">
        {FLOW_STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < currentStep;
          const active = step === currentStep;
          return (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <motion.span
                animate={active ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
                  done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : active
                      ? "rub-agent-pulse bg-[#C9A84C]/20 text-[#C9A84C]"
                      : "bg-white/5 text-white/30"
                }`}
              >
                {done ? "✓" : step}
              </motion.span>
              <span
                className={`hidden text-xs sm:inline ${
                  done
                    ? "text-emerald-400"
                    : active
                      ? "font-semibold text-[#C9A84C]"
                      : "text-white/30"
                }`}
              >
                {label}
              </span>
              {i < FLOW_STEPS.length - 1 && (
                <span className="mx-1 hidden text-white/15 sm:inline">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TRUST_POINTS = [
  "Free to create account",
  "See results before paying",
  "30 day money back guarantee",
];

export function BeforeAfterMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl">
      <div className="grid grid-cols-2">
        <div className="relative bg-[#1a1f26] p-3 sm:p-4">
          <span className="absolute top-2 left-2 rounded bg-red-500/80 px-2 py-0.5 text-[9px] font-bold uppercase">
            Before
          </span>
          <div className="mt-6 space-y-2 opacity-70 saturate-50">
            <div className="h-2 w-16 rounded bg-white/20" />
            <div className="h-16 rounded bg-white/10" />
            <div className="h-2 w-full rounded bg-white/10" />
            <div className="grid grid-cols-3 gap-1">
              <div className="h-8 rounded bg-white/10" />
              <div className="h-8 rounded bg-white/10" />
              <div className="h-8 rounded bg-white/10" />
            </div>
          </div>
        </div>
        <div className="relative bg-[#0D1117] p-3 sm:p-4">
          <span className="absolute top-2 right-2 rounded bg-[#C9A84C] px-2 py-0.5 text-[9px] font-bold text-[#080B10] uppercase">
            After
          </span>
          <div className="mt-6 space-y-2">
            <div className="h-2 w-20 rounded bg-[#C9A84C]/40" />
            <div className="h-16 rounded border border-[#C9A84C]/20 bg-[#C9A84C]/10" />
            <div className="h-2 w-full rounded bg-white/20" />
            <div className="grid grid-cols-3 gap-1">
              <div className="h-8 rounded border border-[#C9A84C]/20 bg-[#C9A84C]/5" />
              <div className="h-8 rounded border border-[#C9A84C]/20 bg-[#C9A84C]/5" />
              <div className="h-8 rounded border border-[#C9A84C]/20 bg-[#C9A84C]/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthMarketingPanel() {
  return (
    <div className="flex flex-col">
      <Link href="/" className="rub-font-display text-2xl font-bold text-[#C9A84C] sm:text-3xl">
        RUB
      </Link>
      <p className="mt-2 text-lg text-white/70 sm:text-xl">Represent Your Business</p>

      <ul className="mt-8 space-y-3">
        {TRUST_POINTS.map((point, i) => (
          <motion.li
            key={point}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, ease: EASE }}
            className="flex items-center gap-2 text-sm text-white/75 sm:text-base"
          >
            <span className="text-emerald-400">✅</span> {point}
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ease: EASE }}
        className="mt-10"
      >
        <BeforeAfterMockup />
      </motion.div>
    </div>
  );
}

export function AuthFormCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-2xl border border-[#C9A84C]/20 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8"
      style={{ boxShadow: "0 8px 40px rgba(201,168,76,0.08)" }}
    >
      {children}
    </motion.div>
  );
}

export function GoogleAuthButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#1f1f1f] shadow-md transition-shadow"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </motion.button>
  );
}

export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-white/40">{text}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function FloatInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  rightSlot,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-11 transition-all duration-200 ${
          active
            ? "top-2 text-[10px] text-[#C9A84C]"
            : "top-1/2 -translate-y-1/2 text-sm text-white/40"
        }`}
      >
        {label}
      </label>
      {icon && (
        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/35">{icon}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`rub-input w-full rounded-xl py-4 pr-12 pl-11 text-white ${active ? "pt-6 pb-2" : ""}`}
      />
      {rightSlot && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

export function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded p-1 text-white/40 hover:text-white/70"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? "🙈" : "👁"}
    </button>
  );
}

export function AuthSplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransition>
      <div className="relative min-h-screen text-white" style={{ backgroundColor: BG }}>
        <AuthBackground />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-16">
          <AuthMarketingPanel />
          <div>{children}</div>
        </div>
      </div>
    </PageTransition>
  );
}

export function GoldPrimaryButton({
  children,
  loading,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.99 }}
      className="rub-btn-gold rub-btn-shimmer relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold disabled:opacity-60"
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

export function OutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full rounded-xl border border-[#C9A84C]/50 bg-transparent px-6 py-3.5 text-sm font-semibold text-[#C9A84C] transition-colors hover:bg-[#C9A84C]/10"
    >
      {children}
    </motion.button>
  );
}

export function SuccessOverlay({
  title,
  subtitle,
  onDone,
}: {
  title: string;
  subtitle: string;
  onDone?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-500/15 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md rounded-2xl border border-emerald-500/30 bg-[#080B10] p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-4xl text-white"
        >
          ✓
        </motion.div>
        <h2 className="rub-font-display mt-6 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-3 text-sm text-white/60">{subtitle}</p>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="mt-6 text-sm text-[#C9A84C] hover:underline"
          >
            Continue now →
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-8 flex justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-colors ${
            i + 1 <= current ? "bg-[#C9A84C]" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}
