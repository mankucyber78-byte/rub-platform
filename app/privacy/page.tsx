"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const BG = "#080B10";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-white" style={{ backgroundColor: BG }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(201,168,76,0.1) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <Link href="/" className="rub-font-display text-2xl font-bold text-[#C9A84C]">
          RUB
        </Link>

        <h1 className="rub-font-display mt-10 text-4xl font-bold text-white sm:text-5xl">
          Privacy Policy
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-white/50">
          We take your privacy seriously. A full privacy policy is coming soon.
        </p>

        <p className="mt-3 text-sm text-white/30">
          Questions? Email us at privacy@rub.com
        </p>

        <Link
          href="/"
          className="rub-btn-gold mt-10 inline-block rounded-xl px-8 py-4 text-base font-bold"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
