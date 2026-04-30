"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// ── Animation helpers ─────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Icon components ───────────────────────────────────────────────────────────
function IconConcept() {
  return (
    <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function IconThinking() {
  return (
    <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconConfidence() {
  return (
    <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function RoadmapIconAssessment() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function RoadmapIconBulb() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function RoadmapIconCalendar() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function RoadmapIconChip() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m16-6h-2m2 6h-2M7 9h.01M17 9h.01M7 15h.01M17 15h.01M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
    </svg>
  );
}

function RoadmapIconGrad() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    Icon: IconConcept,
    title: "Conceptual Clarity",
    desc: "We teach the 'why' before the 'how'. Students who understand deeply remember permanently — marks become a natural outcome.",
  },
  {
    Icon: IconThinking,
    title: "Independent Thinking",
    desc: "Our Socratic method trains students to ask the right questions. We guide discovery rather than hand out answers.",
  },
  {
    Icon: IconConfidence,
    title: "Academic Confidence",
    desc: "Through structured progress, encouragement, and visible growth, every student builds the self-belief to tackle any challenge.",
  },
];

const ROADMAP_PHASES = [
  { number: "01", title: "Diagnostic & Personalized Mapping", Icon: RoadmapIconAssessment },
  { number: "02", title: "Conceptual Fortification", Icon: RoadmapIconBulb },
  { number: "03", title: "Structured Preparation", Icon: RoadmapIconCalendar },
  { number: "04", title: "Technology & AI Integration", Icon: RoadmapIconChip },
  { number: "05", title: "Future Readiness & Mentorship", Icon: RoadmapIconGrad },
];

const STATS = [
  { value: "Play Group–12", label: "All Grades Covered" },
  { value: "100%", label: "Concept-First Teaching" },
  { value: "AI", label: "Powered Tutor" },
  { value: "Mardan", label: "KPK, Pakistan" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              {/* Location badge */}
              <FadeUp delay={0}>
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                                text-orange-600 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  Mardan · Khyber Pakhtunkhwa, Pakistan
                </div>
              </FadeUp>

              <FadeUp delay={0.08}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 leading-[1.06] mb-6">
                  Building{" "}
                  <span className="text-blue-900">Strong Concepts,</span>
                  <br />
                  <span className="text-orange-500">Not Just Marks.</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.16}>
                <p className="text-slate-500 text-lg leading-relaxed max-w-lg mb-10">
                  Transforming student potential into lasting academic success through
                  concept-driven teaching, experienced mentors, and an AI-powered
                  learning environment — from Play Group to Grade 12.
                </p>
              </FadeUp>

              <FadeUp delay={0.22}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/admissions" className="btn-orange">
                    Start the Journey
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/about" className="btn-navy">
                    Learn More
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Right — decorative stat cluster */}
            <FadeIn className="hidden lg:flex flex-col gap-4 items-end">
              {/* Large accent card */}
              <div className="bg-blue-900 text-white rounded-3xl p-8 w-72 shadow-2xl shadow-blue-900/20">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3">Programs</p>
                <div className="space-y-3">
                  {["Play Group – Grade 7", "Grade 8 – Grade 12", "AI-Powered Tutoring"].map((p) => (
                    <div key={p} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                      <span className="text-sm font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI badge */}
              <div className="bg-orange-500 text-white rounded-2xl px-6 py-4 shadow-lg shadow-orange-500/25 flex items-center gap-3 w-64">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm">AI Tutor Active</p>
                  <p className="text-orange-100 text-xs">Ask anything, anytime</p>
                </div>
              </div>

              {/* Tagline card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 w-64">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Our Promise</p>
                <p className="text-slate-700 font-semibold text-sm leading-snug">
                  "Every student has potential. With the right guidance, that potential becomes success."
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <FadeUp key={label} delay={i * 0.08} className="text-center">
              <p className="text-3xl lg:text-4xl font-extrabold text-white mb-1">{value}</p>
              <p className="text-slate-400 text-sm lg:text-base">{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ PROGRAMS ══════════════════════════ */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <span className="section-label">Our Programs</span>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 mt-3">
              Two Wings, One Mission
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Carefully structured programs for every stage of a student&apos;s academic journey.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Junior Wing */}
            <FadeUp delay={0}>
              <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm card-lift">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  Junior Wing
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Play Group – Grade 7</h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Building rock-solid foundations with personalised attention in a
                  nurturing, age-appropriate environment. Small groups, big results.
                </p>
                <ul className="space-y-2.5">
                  {["Small group classes for focused attention", "Play-based & structured learning", "Regular parent progress updates", "Foundational Maths, English & Science"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Senior Wing */}
            <FadeUp delay={0.1}>
              <div className="bg-blue-900 rounded-3xl p-10 shadow-xl shadow-blue-900/20 card-lift text-white">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="inline-block bg-orange-400/20 text-orange-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  Senior Wing
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">Grade 8 – Grade 12</h3>
                <p className="text-blue-200 leading-relaxed mb-6">
                  Rigorous board exam preparation with deep conceptual teaching,
                  monthly assessments, and dedicated subject specialists.
                </p>
                <ul className="space-y-2.5">
                  {["Complete board syllabus coverage", "Monthly mock exams & detailed feedback", "Subject specialists for every course", "University & career guidance sessions"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-blue-100">
                      <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* ══════════════════════════ PHILOSOPHY ══════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <span className="section-label">The Aspire Difference</span>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 mt-3">
              Our Teaching Philosophy
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Three core principles that separate genuine understanding from
              surface-level memorisation.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {PILLARS.map(({ Icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.1}>
                <div className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100
                               hover:bg-white hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-14 h-14 bg-white group-hover:bg-orange-50 rounded-2xl
                                  flex items-center justify-center mb-6 shadow-sm
                                  border border-slate-100 group-hover:border-orange-200 transition-all duration-300">
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ ROADMAP PREVIEW ══════════════════════════ */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-14">
            <span className="section-label">The Academic Journey</span>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 mt-3">
              Your Roadmap to Success
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              A structured five-phase approach that takes every student from assessment
              to achievement — with the right guidance at every stage.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {ROADMAP_PHASES.map(({ number, title, Icon }, i) => (
              <FadeUp key={number} delay={i * 0.08}>
                <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm
                               hover:border-orange-200 hover:shadow-md transition-all duration-300 h-full
                               flex flex-col items-center text-center card-lift">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white text-xs font-black
                                  flex items-center justify-center mb-4 flex-shrink-0">
                    {parseInt(number)}
                  </div>
                  <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl
                                  flex items-center justify-center mb-4
                                  group-hover:bg-orange-100 transition-colors">
                    <Icon />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{title}</h3>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp className="text-center">
            <Link href="/roadmap" className="btn-navy">
              Explore the Full Roadmap
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </FadeUp>

        </div>
      </section>

      {/* ══════════════════════════ AI FEATURE ══════════════════════════ */}
      <section className="py-28 bg-blue-950 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-800/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <FadeUp delay={0}>
              <span className="section-label text-orange-400">AI-Powered Learning</span>
              <h2 className="text-4xl font-extrabold text-white mt-3 mb-6 leading-tight">
                Your Personal Tutor,
                <br />
                <span className="text-orange-400">Available 24 / 7.</span>
              </h2>
              <p className="text-blue-200 text-lg leading-relaxed mb-8">
                Ask any academic question and receive guided, Socratic answers that
                build understanding — not just correct answers. Your AI tutor remembers
                your session context and adapts to your learning pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/ai-tutor" className="btn-orange">
                  Try the AI Tutor
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/signup" className="btn-white">
                  Create Free Account
                </Link>
              </div>
            </FadeUp>

            {/* Faux chat preview */}
            <FadeIn>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    A
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Aspire AI Tutor</p>
                    <p className="text-blue-300 text-xs">Building Strong Concepts</p>
                  </div>
                  <span className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  <div className="flex items-end gap-2.5">
                    <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-white/90 text-sm leading-relaxed">Assalamu Alaikum! I&apos;m here to help you understand — not just memorise. What topic shall we explore today?</p>
                    </div>
                  </div>

                  <div className="flex items-end gap-2.5 justify-end">
                    <div className="bg-orange-500/90 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-white text-sm">Can you explain Newton&apos;s laws?</p>
                    </div>
                    <div className="w-7 h-7 bg-blue-400/30 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">U</div>
                  </div>

                  <div className="flex items-end gap-2.5">
                    <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-white/90 text-sm leading-relaxed">Great question! Before I explain, tell me — have you ever pushed a heavy box and felt it push back? What did you notice?</p>
                    </div>
                  </div>
                </div>

                {/* Input mock */}
                <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 mt-2">
                  <p className="text-blue-300 text-sm flex-1">Ask me anything…</p>
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ REVIEWS HOOK ══════════════════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute -top-24 right-0 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-0 w-96 h-96 bg-blue-900/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <FadeUp>
            <span className="section-label">Student &amp; Parent Voices</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-4">
              Hear It From Our Families
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              The best measure of an academy is the growth its students experience.
              Read what students and parents have to say — then add your own voice.
            </p>
          </FadeUp>

          {/* Stars */}
          <FadeUp delay={0.08}>
            <div className="flex justify-center gap-2 mb-10">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} className="w-9 h-9 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </FadeUp>

          {/* Community badges */}
          <FadeUp delay={0.12}>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                { label: "Grade 10 Students", type: "student" },
                { label: "Parents of FSc Students", type: "parent" },
                { label: "Matric Candidates", type: "student" },
                { label: "Parents of Junior Wing", type: "parent" },
              ].map(({ label, type }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border
                    ${type === "student"
                      ? "bg-orange-50 text-orange-600 border-orange-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.16}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/reviews" className="btn-navy">
                Read All Reviews
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold
                           text-orange-500 border-2 border-orange-200 rounded-xl
                           hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                Share Your Experience
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>
          </FadeUp>

        </div>
      </section>

      {/* ══════════════════════════ CONNECT WITH US ══════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeUp>
            <span className="section-label">Follow Along</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">
              Connect With Us
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto mb-10">
              Stay updated with Aspire Learning Hub — follow our pages and join our community for
              news, resources, and announcements.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  href: "https://www.instagram.com/aspire__learning__hub?igsh=MWlsOXhkbDM0dmMyaQ==",
                  label: "Instagram",
                  sub: "@aspire__learning__hub",
                  iconColor: "text-pink-500",
                  hoverBg: "hover:border-pink-300 hover:bg-pink-50/60",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  ),
                },
                {
                  href: "https://www.facebook.com/profile.php?id=61580876798186",
                  label: "Facebook",
                  sub: "Aspire Learning Hub",
                  iconColor: "text-blue-600",
                  hoverBg: "hover:border-blue-300 hover:bg-blue-50/60",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  ),
                },
                {
                  href: "https://whatsapp.com/channel/0029Vb6fdcwDDmFegq9wXx27",
                  label: "Updates",
                  sub: "WhatsApp Channel",
                  iconColor: "text-green-600",
                  hoverBg: "hover:border-green-300 hover:bg-green-50/60",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  ),
                },
                {
                  href: "https://chat.whatsapp.com/KkRSznSot4yGG19yXRkJTP",
                  label: "Join Community",
                  sub: "WhatsApp Group",
                  iconColor: "text-green-600",
                  hoverBg: "hover:border-green-300 hover:bg-green-50/60",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  ),
                },
              ].map(({ href, label, sub, iconColor, hoverBg, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-200
                              ${hoverBg} hover:shadow-md transition-all duration-200 group`}
                >
                  <span className={`${iconColor} transition-transform group-hover:scale-110 duration-200`}>
                    {icon}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      <section className="py-28 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-orange-800/20 rounded-full blur-3xl pointer-events-none" />

        <FadeUp className="relative max-w-3xl mx-auto px-4">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Join Aspire Learning Hub
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Ready to Start
            <br />
            the Journey?
          </h2>
          <p className="text-orange-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Every student has potential. With the right guidance, mentorship, and
            learning environment, that potential becomes lasting success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600
                         font-bold rounded-xl hover:bg-orange-50 transition-all text-sm shadow-lg
                         shadow-orange-700/30 hover:-translate-y-0.5">
              Apply for Admission
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/60
                         text-white font-semibold rounded-xl hover:border-white hover:bg-white/10
                         transition-all text-sm">
              Create a Free Account
            </Link>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
