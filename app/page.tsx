"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ErrorBanner, Spinner } from "@/components/rub-ui";
import { normalizeUrl, setStoredUrl } from "@/lib/rub-storage";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";

const GOLD = "#C9A84C";
const DARK = "#0D1117";

function FadeUp({
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(target);
  }, [inView, motionValue, target]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref} className="font-semibold text-[#C9A84C]">
      {display.toLocaleString()}
    </span>
  );
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  size: 2 + (i % 3),
  delay: (i % 8) * 0.4,
  duration: 6 + (i % 5),
}));

function GoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#C9A84C]/40"
          style={{
            left: p.left,
            bottom: "-10%",
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -900],
            opacity: [0, 0.8, 0],
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

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Examples", href: "#testimonials" },
];

const STEPS = [
  { icon: "🔗", title: "Paste your URL", desc: "Drop your existing website link to get started." },
  { icon: "✅", title: "Verify you own it", desc: "Quick ownership check keeps your site secure." },
  { icon: "📷", title: "Upload photos and videos", desc: "Share your media so AI can enhance everything." },
  { icon: "🤖", title: "AI redesigns everything", desc: "10 specialized agents rebuild your frontend." },
  { icon: "👀", title: "Preview for free", desc: "See the full redesign before you pay a cent." },
  { icon: "🚀", title: "Pay $39 and go live", desc: "One-time payment. Your new site goes live instantly." },
];

const AGENTS = [
  { emoji: "🔍", name: "Scout", role: "Scans your website" },
  { emoji: "🧠", name: "Einstein", role: "Analyzes your business" },
  { emoji: "👁", name: "Critic", role: "Rates your design" },
  { emoji: "📈", name: "SEO Guy", role: "Checks Google ranking" },
  { emoji: "✍️", name: "Writer", role: "Rewrites your content" },
  { emoji: "🎨", name: "Picasso", role: "Creates new design" },
  { emoji: "📸", name: "Ansel", role: "Enhances your photos" },
  { emoji: "🎬", name: "Spielberg", role: "Optimizes your videos" },
  { emoji: "✅", name: "Rex", role: "Quality checks everything" },
  { emoji: "🚀", name: "Publisher", role: "Deploys your site live" },
];

const PRICING_FEATURES = [
  "Full AI redesign",
  "10 photos enhanced",
  "5 videos optimized",
  "SEO improvements",
  "30 day rollback",
  "Switch old/new anytime",
  "Backend never touched",
];

const TESTIMONIALS = [
  {
    name: "Marco R.",
    role: "Restaurant owner, Chicago",
    text: "My old site looked like 2010. RUB gave me something I'm proud to show customers — in one afternoon.",
    stars: 5,
  },
  {
    name: "Sarah K.",
    role: "Salon owner, Miami",
    text: "I was skeptical about AI, but the preview blew me away. Paid $39 and never looked back.",
    stars: 5,
  },
  {
    name: "James T.",
    role: "Clinic owner, Austin",
    text: "Backend stayed untouched — exactly what I needed. Patients love the new look.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "Will my website break?",
    a: "No. RUB only redesigns your frontend. Your backend, database, and integrations stay exactly as they are.",
  },
  {
    q: "What if I don't like it?",
    a: "Preview the full redesign for free before paying. If it's not right, you owe nothing.",
  },
  {
    q: "Can I go back to old design?",
    a: "Yes. Switch between your old and new design anytime. You have a 30-day rollback guarantee.",
  },
  {
    q: "How long does it take?",
    a: "Most redesigns complete in about 10 minutes after you upload your media and verify ownership.",
  },
  {
    q: "What platforms do you support?",
    a: "Any public website — WordPress, Wix, Squarespace, custom HTML, and more. If it has a URL, RUB can redesign it.",
  },
  {
    q: "Is my payment refundable?",
    a: "Yes. If you're not satisfied within 30 days, contact us for a full refund.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="text-[#C9A84C]" aria-label={`${count} stars`}>
      {"★".repeat(count)}
    </span>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-white transition-colors hover:text-[#C9A84C]"
        aria-expanded={open}
      >
        <span className="text-base font-medium sm:text-lg">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-2xl text-[#C9A84C]"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-white/60 sm:text-base">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setUrlError("Please enter your website URL");
      return;
    }
    setUrlError("");
    setAnalyzing(true);
    try {
      const normalized = normalizeUrl(url);
      setStoredUrl(normalized);
      await new Promise((r) => setTimeout(r, 400));
      router.push("/analyze");
    } catch {
      setUrlError("Something went wrong. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: DARK }}
    >
      {/* STICKY NAVBAR */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-[#0D1117]/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="text-xl font-bold tracking-tight text-[#C9A84C]">
            RUB
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-[#C9A84C]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#hero"
              className="hidden rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#0D1117] transition-opacity hover:opacity-90 sm:inline-block"
            >
              Get Started
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/5 md:hidden"
            >
              <ul className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-white/70 hover:text-[#C9A84C]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#hero"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 block rounded-lg bg-[#C9A84C] px-4 py-3 text-center text-sm font-semibold text-[#0D1117]"
                  >
                    Get Started
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section
        id="hero"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:px-6"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.15) 0%, transparent 70%)",
          }}
        />
        <GoldParticles />

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <FadeUp>
            <h1
              className="text-4xl leading-tight font-normal text-white sm:text-5xl md:text-6xl lg:text-7xl"
              style={{
                fontFamily:
                  'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              }}
            >
              Give Your Old Website A{" "}
              <span className="text-[#C9A84C]">New Life</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              AI redesigns your website in 10 minutes. Frontend only. Backend
              never touched.
            </p>
          </FadeUp>

          <FadeUp delay={0.2} className="mt-10 w-full">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="w-full flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError("");
                  }}
                  placeholder="Paste your website URL here..."
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-5 py-4 text-white placeholder:text-white/40 outline-none transition-colors focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30"
                />
                {urlError && <ErrorBanner message={urlError} />}
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-8 py-4 text-base font-bold text-[#0D1117] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {analyzing && <Spinner />}
                Analyze My Website
              </button>
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/70">
              {[
                "Free preview",
                "No card needed",
                "30 day guarantee",
                "Backend never touched",
              ].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <span className="text-[#C9A84C]">✅</span> {badge}
                </span>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.4} className="mt-10">
            <p className="text-sm text-white/50 sm:text-base">
              <AnimatedCounter target={2341} /> websites redesigned
            </p>
          </FadeUp>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              How RUB Works
            </h2>
          </FadeUp>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeUp key={step.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-[#C9A84C]/40 hover:bg-white/[0.07]">
                  <span className="text-3xl" role="img" aria-hidden>
                    {step.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {step.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 10 AI AGENTS */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              10 AI Agents Work For You
            </h2>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {AGENTS.map((agent, i) => (
              <FadeUp key={agent.name} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group cursor-default rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition-colors hover:border-[#C9A84C]"
                >
                  <span className="text-3xl" role="img" aria-hidden>
                    {agent.emoji}
                  </span>
                  <h3 className="mt-3 font-semibold text-[#C9A84C]">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">{agent.role}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      >
        <div className="mx-auto max-w-2xl">
          <FadeUp className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              One Simple Price
            </h2>
          </FadeUp>

          <FadeUp>
            <div className="rounded-3xl border border-[#C9A84C]/30 bg-white/5 p-8 text-center sm:p-12">
              <p
                className="text-6xl font-bold sm:text-7xl"
                style={{ color: GOLD }}
              >
                $39
              </p>
              <p className="mt-2 text-lg text-white/60">One time payment</p>

              <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left text-sm text-white/80 sm:text-base">
                {PRICING_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-[#C9A84C]">✅</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-8 py-4 text-base font-bold text-[#0D1117] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 sm:mx-auto sm:w-auto sm:min-w-[280px]"
              >
                {analyzing && <Spinner />}
                Analyze My Website
              </button>
              <p className="mt-4 text-sm text-white/40">
                No credit card needed to preview
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              What Business Owners Say
            </h2>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                  <Stars count={t.stars} />
                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <FadeUp className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">FAQ</h2>
          </FadeUp>

          <FadeUp>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <span className="text-2xl font-bold text-[#C9A84C]">RUB</span>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-[#C9A84C]">
                Privacy
              </a>
              <a href="#" className="hover:text-[#C9A84C]">
                Terms
              </a>
              <a href="#" className="hover:text-[#C9A84C]">
                Contact
              </a>
            </nav>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} RUB — Represent Your Business
            </p>
          </div>
        </FadeUp>
      </footer>
    </div>
  );
}
