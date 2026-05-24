"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";

export const GOLD = "#C9A84C";
export const DARK = "#0D1117";
export const EASE = [0.22, 1, 0.36, 1] as const;

export function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({
  children,
  className = "",
  gold = false,
}: {
  children: React.ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl ${gold ? "glass-card-gold" : "glass-card"} ${className}`}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card flex flex-col items-center rounded-2xl px-6 py-14 text-center"
    >
      <span className="text-5xl">{icon}</span>
      <h3 className="rub-heading-lg mt-4 text-xl font-semibold text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-white/50">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function AnimatedNumber({
  value,
  className = "",
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2200, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Hero3DBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -20%, rgba(201,168,76,0.18) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(201,168,76,0.06) 0%, transparent 50%)",
        }}
      />
      <motion.div
        className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full opacity-30"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, rgba(201,168,76,0.15), transparent, rgba(201,168,76,0.08), transparent)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/4 -left-32 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(201,168,76,0.08)" }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(201,168,76,0.06)" }}
        animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 11 + 5) % 98}%`,
  size: 1.5 + (i % 4),
  delay: (i % 10) * 0.35,
  duration: 5 + (i % 6),
}));

export function GoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size,
            height: p.size,
            background: `rgba(201,168,76,${0.25 + (p.id % 3) * 0.15})`,
            boxShadow: "0 0 6px rgba(201,168,76,0.4)",
          }}
          animate={{
            y: [0, -900],
            opacity: [0, 0.9, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

const TICKER_ITEMS = [
  "Marco just redesigned his restaurant site in Chicago",
  "Sarah published her new salon website in Miami",
  "James switched to new design — 98 mobile score",
  "2,341+ WordPress sites redesigned with RUB",
  "New design live in under 10 minutes",
  "Backend never touched — 100% safe",
];

export function LiveActivityTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-black/20 py-3">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-2 text-xs text-white/45 sm:text-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function GoldConfetti({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${(i * 13 + 2) % 100}%`,
    color: i % 3 === 0 ? GOLD : i % 3 === 1 ? "#e8c96a" : "#f5e6b8",
    delay: (i % 8) * 0.05,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: p.left,
            top: "-2%",
            width: 6 + (p.id % 4),
            height: 10 + (p.id % 3),
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            opacity: [1, 1, 0],
            rotate: 360 + p.id * 20,
          }}
          transition={{
            duration: 2.5 + (p.id % 3),
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export function PremiumProgressBar({
  value,
  className = "",
  height = "h-2.5",
}: {
  value: number;
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-full bg-white/10 ${height} ${className}`}
    >
      <motion.div
        className={`h-full rounded-full rub-progress-bar ${height}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </div>
  );
}

export function TrustBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      whileHover={{ scale: 1.03, y: -1 }}
      className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white/70 sm:text-sm"
    >
      {children}
    </motion.span>
  );
}

export function LiveDot({ color = "emerald" }: { color?: "emerald" | "gold" }) {
  const bg = color === "gold" ? "bg-[#C9A84C]" : "bg-emerald-500";
  const ping = color === "gold" ? "bg-[#C9A84C]" : "bg-emerald-400";
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${ping} opacity-75`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${bg}`} />
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {eyebrow && (
        <p className="text-sm font-medium tracking-wide text-[#C9A84C] uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="rub-heading-lg mt-2 text-3xl font-bold text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
