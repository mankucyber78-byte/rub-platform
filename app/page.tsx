"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CharityCauseGrid } from "@/components/rub-charity";
import { ErrorBanner, Spinner } from "@/components/rub-ui";
import {
  AnimatedNumber,
  FadeUp,
  GlassCard,
  GoldParticles,
  Hero3DBackground,
  LiveActivityTicker,
  PageTransition,
  SectionHeading,
  TrustBadge,
} from "@/components/rub-premium";
import {
  clearStoredUser,
  getStoredUser,
  normalizeUrl,
  setPendingUrl,
  setStoredUrl,
  type RubUser,
} from "@/lib/rub-storage";
import { AnimatePresence, motion } from "framer-motion";

const DARK = "#0D1117";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Free Autopsy", href: "/autopsy", gold: true },
  { label: "Pricing", href: "#pricing" },
  { label: "Examples", href: "#testimonials" },
];

const STEPS = [
  { icon: "🔗", title: "Paste your URL", desc: "Drop your existing website link to get started." },
  { icon: "✅", title: "Verify you own it", desc: "Quick ownership check keeps your site secure." },
  { icon: "📷", title: "Upload photos and videos", desc: "Share your media so AI can enhance everything." },
  { icon: "🤖", title: "AI redesigns everything", desc: "10 specialized agents rebuild your frontend." },
  { icon: "👀", title: "Preview for free", desc: "See the full redesign before you pay a cent." },
  { icon: "🚀", title: "Pay $49.99 and go live", desc: "One-time payment. Your new site goes live instantly." },
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
    text: "I was skeptical about AI, but the preview blew me away. Paid $49.99 and never looked back.",
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
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-white transition-colors hover:text-[#C9A84C]"
        aria-expanded={open}
      >
        <span className="text-base font-medium sm:text-lg">{q}</span>
        <span
          className="relative flex h-7 w-7 shrink-0 items-center justify-center text-2xl leading-none text-[#C9A84C]"
          aria-hidden
        >
          <motion.span
            initial={false}
            animate={{ opacity: open ? 0 : 1, scale: open ? 0.5 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            +
          </motion.span>
          <motion.span
            initial={false}
            animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            −
          </motion.span>
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-relaxed text-white/60 sm:text-base">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [user, setUser] = useState<RubUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleSignOut = () => {
    clearStoredUser();
    setUser(null);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setUrlError("Please enter your website URL");
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }
    setUrlError("");
    setAnalyzing(true);
    try {
      const normalized = normalizeUrl(url);
      const currentUser = getStoredUser();

      if (!currentUser) {
        setPendingUrl(normalized);
        await new Promise((r) => setTimeout(r, 400));
        router.push("/sign-up");
        return;
      }

      setStoredUrl(normalized);
      await new Promise((r) => setTimeout(r, 400));
      router.push("/verify");
    } catch {
      setUrlError("Something went wrong. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <PageTransition>
    <div
      className="min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: DARK }}
    >
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-[#0D1117]/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="text-xl font-bold tracking-tight text-[#C9A84C]">
            RUB
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`text-sm transition-colors hover:text-[#C9A84C] ${
                    "gold" in link && link.gold
                      ? "font-semibold text-[#C9A84C]"
                      : "text-white/70"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <a
                  href="/dashboard"
                  className="hidden text-sm text-white/70 hover:text-[#C9A84C] sm:inline"
                >
                  Dashboard
                </a>
                <span className="hidden max-w-[120px] truncate text-xs text-white/50 sm:inline sm:max-w-[160px] sm:text-sm">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="hidden text-sm text-white/50 hover:text-white sm:inline"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="hidden text-sm text-white/70 hover:text-[#C9A84C] sm:inline"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("hero");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rub-btn-gold hidden rounded-xl px-4 py-2 text-sm sm:inline-block"
                >
                  Get Started
                </button>
              </>
            )}
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
                      className={`block py-2 hover:text-[#C9A84C] ${
                        "gold" in link && link.gold
                          ? "font-semibold text-[#C9A84C]"
                          : "text-white/70"
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="border-t border-white/10 pt-3">
                  {user ? (
                    <>
                      <a
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-white/70 hover:text-[#C9A84C]"
                      >
                        Dashboard
                      </a>
                      <p className="truncate py-1 text-xs text-white/40">{user.email}</p>
                      <button
                        type="button"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="py-2 text-sm text-white/50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push("/sign-in");
                        }}
                        className="block w-full py-2 text-left text-white/70 hover:text-[#C9A84C]"
                      >
                        Sign In
                      </button>
                      <a
                        href="#hero"
                        onClick={() => setMobileMenuOpen(false)}
                        className="mt-2 block rounded-lg bg-[#C9A84C] px-4 py-3 text-center text-sm font-semibold text-[#0D1117]"
                      >
                        Get Started
                      </a>
                    </>
                  )}
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
        <Hero3DBackground />
        <GoldParticles />

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <FadeUp>
            <h1 className="rub-heading-xl text-4xl text-white sm:text-5xl md:text-6xl lg:text-7xl">
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
            <GlassCard gold className="p-2 sm:p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="w-full flex-1">
                <motion.input
                  type="url"
                  value={url}
                  animate={shakeInput ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError("");
                  }}
                  placeholder="Paste your website URL here..."
                  whileFocus={{ scale: 1.01 }}
                  className="rub-input w-full rounded-xl px-5 py-4 text-white placeholder:text-white/40"
                />
                {urlError && <ErrorBanner message={urlError} />}
              </div>
              <motion.button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                whileTap={{ scale: 0.98 }}
                className="rub-btn-gold flex shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-4 text-base"
              >
                {analyzing && <Spinner />}
                Analyze My Website
              </motion.button>
            </div>
            </GlassCard>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                "Free preview",
                "No card needed",
                "30 day guarantee",
                "Backend never touched",
              ].map((badge) => (
                <TrustBadge key={badge}>
                  <span className="text-[#C9A84C]">✓</span> {badge}
                </TrustBadge>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.4} className="mt-10">
            <p className="text-sm text-white/50 sm:text-base">
              <AnimatedNumber value={2341} className="font-semibold text-[#C9A84C]" />{" "}
              websites redesigned
            </p>
          </FadeUp>
        </div>
      </section>

      <LiveActivityTicker />

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-14">
            <SectionHeading title="How RUB Works" subtitle="From URL to live redesign in minutes" />
          </FadeUp>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <FadeUp key={step.title} delay={i * 0.08}>
                <motion.div whileHover={{ y: -4 }} className="h-full">
                <GlassCard className="h-full p-6 transition-colors hover:border-[#C9A84C]/30">
                  <span className="text-3xl" role="img" aria-hidden>
                    {step.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {step.desc}
                  </p>
                </GlassCard>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 10 AI AGENTS */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-14">
            <SectionHeading title="10 AI Agents Work For You" subtitle="Specialized AI working in parallel for your business" />
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {AGENTS.map((agent, i) => (
              <FadeUp key={agent.name} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  className="group h-full"
                >
                  <GlassCard className="h-full p-5 text-center transition-all group-hover:border-[#C9A84C]/50 group-hover:shadow-[0_0_24px_rgba(201,168,76,0.12)]">
                  <motion.span className="inline-block text-3xl" whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}>
                    {agent.emoji}
                  </motion.span>
                  <h3 className="mt-3 font-semibold text-[#C9A84C]">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">{agent.role}</p>
                  </GlassCard>
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
            <GlassCard gold className="p-8 text-center sm:p-12">
              <p
                className="text-6xl font-bold sm:text-7xl"
                style={{ color: "#C9A84C" }}
              >
                $49.99
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

              <motion.button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                whileTap={{ scale: 0.98 }}
                className="rub-btn-gold mt-10 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base sm:mx-auto sm:w-auto sm:min-w-[280px]"
              >
                {analyzing && <Spinner />}
                Analyze My Website
              </motion.button>
              <p className="mt-4 text-sm text-white/40">
                No credit card needed to preview
              </p>
            </GlassCard>
          </FadeUp>
        </div>
      </section>

      {/* GIVING BACK */}
      <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <FadeUp>
            <h2 className="rub-font-display text-3xl font-bold text-white sm:text-4xl">
              Every redesign gives back
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/55 sm:text-lg">
              7% of every payment goes directly to people who need it most
            </p>
          </FadeUp>

          <div className="mt-12">
            <CharityCauseGrid />
          </div>

          <FadeUp className="mt-8">
            <a
              href="/giving"
              className="inline-block text-sm font-semibold text-[#C9A84C] transition-colors hover:underline sm:text-base"
            >
              See our giving page →
            </a>
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

          <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1} className="h-full">
                <motion.div whileHover={{ y: -4 }} className="h-full">
                  <GlassCard className="flex h-full min-h-[280px] flex-col justify-between p-6">
                    <div>
                      <Stars count={t.stars} />
                      <p className="mt-4 text-sm leading-relaxed text-white/70">
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </GlassCard>
                </motion.div>
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
            <GlassCard className="px-6">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </GlassCard>
          </FadeUp>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,168,76,0.15) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeUp>
            <h2 className="rub-font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to transform your website?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/55 sm:text-lg">
              Join thousands of business owners who chose RUB
            </p>
            <motion.button
              type="button"
              onClick={() => {
                document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
              }}
              whileTap={{ scale: 0.98 }}
              className="rub-btn-gold mt-10 inline-flex items-center justify-center gap-2 rounded-xl px-10 py-4 text-base sm:text-lg"
            >
              Analyze My Website Free →
            </motion.button>
            <div className="mt-4 space-y-1 text-sm text-white/40">
              <p>No credit card needed</p>
              <p>See results before paying</p>
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
    </PageTransition>
  );
}
