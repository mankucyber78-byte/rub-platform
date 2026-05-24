"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CharityCauseGrid } from "@/components/rub-charity";
import { GoldParticles, PageTransition, EASE } from "@/components/rub-premium";

const BG = "#080B10";

export default function GivingPage() {
  return (
    <PageTransition>
      <div className="relative min-h-screen text-white" style={{ backgroundColor: BG }}>
        <div className="rub-radial-glow pointer-events-none absolute inset-0" />
        <GoldParticles />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link href="/" className="rub-font-display text-xl font-bold text-[#C9A84C] sm:text-2xl">
            RUB
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-12 text-center"
          >
            <h1 className="rub-font-display text-4xl font-bold text-white sm:text-5xl">
              Giving Back
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
              7% of every RUB payment goes to people who need it most
            </p>
          </motion.div>

          <div className="mt-14">
            <CharityCauseGrid />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-16 rounded-2xl border border-[#C9A84C]/20 bg-white/[0.03] p-8 text-center sm:p-10"
          >
            <p className="text-sm leading-relaxed text-white/60 sm:text-base">
              Every time a business owner transforms their website with RUB, someone
              somewhere gets help.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-white/50 sm:text-base">
              No complicated process. No choosing where it goes. 7% goes automatically.
              Every single order. Every single time.
            </p>

            <Link
              href="/"
              className="rub-btn-gold rub-btn-shimmer relative mt-10 inline-block rounded-xl px-8 py-4 text-base font-bold"
            >
              Transform Your Website →
            </Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
