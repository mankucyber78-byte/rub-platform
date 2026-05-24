"use client";

import { motion } from "framer-motion";
import { FadeUp, EASE } from "@/components/rub-premium";

export const CHARITY_CAUSES = [
  {
    emoji: "🏠",
    title: "Old Age Homes",
    description:
      "Supporting elderly people who dedicated their lives to their families and communities. Your payment helps give them the care, dignity and warmth they deserve.",
  },
  {
    emoji: "👶",
    title: "Orphanages",
    description:
      "Every child deserves a safe home, warm meals and someone who cares. Your payment helps give orphaned children exactly that.",
  },
  {
    emoji: "🎓",
    title: "Education",
    description:
      "Knowledge changes lives forever. Your payment helps children who cannot afford school get access to education and a brighter future.",
  },
] as const;

const CARD_SHELL =
  "relative flex h-full min-h-[320px] flex-col rounded-2xl border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.05)] p-8 shadow-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-[#C9A84C] group-hover:shadow-[0_14px_52px_rgba(201,168,76,0.38)]";

function CharityCauseCard({
  cause,
}: {
  cause: (typeof CHARITY_CAUSES)[number];
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="group h-full"
    >
      <div className={CARD_SHELL}>
        <span className="text-center text-5xl sm:text-6xl" aria-hidden>
          {cause.emoji}
        </span>
        <h3 className="rub-font-display mt-6 text-center text-xl font-semibold text-[#C9A84C] sm:text-2xl">
          {cause.title}
        </h3>
        <p className="mt-4 flex-1 text-center text-sm leading-relaxed text-white/70 sm:text-[15px]">
          {cause.description}
        </p>
      </div>
    </motion.div>
  );
}

export function CharityCauseGrid() {
  return (
    <>
      <FadeUp>
        <p
          className="rub-font-display mx-auto mb-10 max-w-md text-center text-sm italic sm:text-base"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Because business success means nothing without human impact
        </p>
      </FadeUp>

      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
        {CHARITY_CAUSES.map((cause, i) => (
          <FadeUp key={cause.title} delay={i * 0.08} className="h-full min-h-[320px]">
            <CharityCauseCard cause={cause} />
          </FadeUp>
        ))}
      </div>

      <FadeUp className="mt-10">
        <p className="text-center text-sm font-medium text-white/60 sm:text-base">
          Automatically with every order. No action needed from you. ❤️
        </p>
      </FadeUp>
    </>
  );
}
