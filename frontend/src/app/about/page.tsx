"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// ── Reusable animation wrapper ────────────────────────────────────────────────
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

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconConcept() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
function IconCuriosity() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconConfidence() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
function IconDiscipline() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IconSuccess() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const PHILOSOPHY_STEPS = [
  {
    number: "01",
    Icon: IconConcept,
    title: "Building Strong Concepts",
    desc: "We teach the 'why' before the 'how'. Deep understanding outlasts any examination — marks become a natural by-product of genuine comprehension.",
  },
  {
    number: "02",
    Icon: IconCuriosity,
    title: "Encouraging Curiosity",
    desc: "Questions are celebrated, never silenced. Our Socratic method trains students to think critically and discover answers through guided inquiry.",
  },
  {
    number: "03",
    Icon: IconConfidence,
    title: "Improving Academic Confidence",
    desc: "Through structured progress and visible growth, every student builds the self-belief needed to tackle any academic challenge with composure.",
  },
  {
    number: "04",
    Icon: IconDiscipline,
    title: "Disciplined Study Habits",
    desc: "Consistency beats intensity. We help students build routines, organise their time, and develop the discipline that transforms potential into achievement.",
  },
  {
    number: "05",
    Icon: IconSuccess,
    title: "Long-term Success",
    desc: "We prepare students not just for the next exam, but for life. Our graduates carry strong foundations into university, careers, and beyond.",
  },
];

const PROGRAMS = [
  {
    badge: "Junior Wing",
    badgeColor: "bg-blue-50 text-blue-700",
    title: "Play Group – Grade 7",
    desc: "Rock-solid academic foundations built through personalised attention, play-based learning, and age-appropriate structured curricula in a nurturing environment.",
    features: [
      "Small groups for focused attention",
      "Play-based & structured learning",
      "Foundational Maths, English & Science",
      "Regular parent progress updates",
    ],
    accent: "border-t-4 border-blue-700",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
  },
  {
    badge: "Senior Wing",
    badgeColor: "bg-orange-50 text-orange-600",
    title: "Grade 8 – Grade 12",
    desc: "Rigorous board exam preparation with deep conceptual teaching, monthly mock assessments, and dedicated subject specialists covering every course.",
    features: [
      "Complete board syllabus coverage",
      "Monthly mock exams & feedback",
      "Subject specialists per course",
      "University & career guidance",
    ],
    accent: "border-t-4 border-orange-500",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    badge: "Skill Development",
    badgeColor: "bg-slate-100 text-slate-600",
    title: "Skill Development",
    desc: "Practical workshops and programmes designed to build transferable skills — communication, critical thinking, and digital literacy — for the modern world.",
    features: [
      "Practical, real-world workshops",
      "Critical thinking & communication",
      "Digital literacy programmes",
      "Confidence-building activities",
    ],
    accent: "border-t-4 border-slate-400",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-500",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const instructorImg1 = process.env.NEXT_PUBLIC_INSTRUCTOR_IMG_1 ?? "/assets/pic1.jpeg";

export default function AboutPage() {
  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                            text-orange-600 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              Mardan · Khyber Pakhtunkhwa, Pakistan
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.08] mb-6">
              Our Story,{" "}
              <span className="text-blue-900">Our Mission,</span>
              <br />
              <span className="text-orange-500">Our Promise.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Aspire Learning Hub was founded on a simple conviction — that every student deserves
              education that builds genuine understanding, not just examination scores.
            </p>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admissions" className="btn-orange">
                Start the Journey
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/admissions" className="btn-navy">
                View Admissions
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════ MISSION & VISION — SPLIT LAYOUT ══════════════ */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <FadeUp delay={0}>
              <span className="section-label">Who We Are</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-6 leading-tight">
                Our Mission{" "}
                <span className="text-blue-900">&amp; Vision</span>
              </h2>

              <p className="text-slate-500 leading-relaxed mb-10 text-base">
                Aspire Learning Hub is a concept-driven educational institute committed to
                building strong academic foundations and helping students achieve excellence.
                Our focus is not just on marks, but on developing understanding, confidence,
                critical thinking, and long-term academic growth.
              </p>

              <div className="space-y-6">
                {/* Mission */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Our Mission</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      To provide high-quality, accessible, concept-driven education that empowers
                      students academically, intellectually, and personally.
                    </p>
                  </div>
                </div>

                {/* Vision */}
                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Our Vision</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      To become the most trusted learning platform known for academic excellence,
                      student development, and innovative teaching methods that prepare learners
                      for both exams and life.
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <div className="mt-8 pl-5 border-l-4 border-orange-400">
                  <p className="text-slate-700 font-semibold text-base italic leading-snug">
                    &ldquo;Building Strong Concepts, Not Just Marks.&rdquo;
                  </p>
                  <p className="text-slate-400 text-sm mt-1">— Aspire Learning Hub</p>
                </div>
              </div>
            </FadeUp>

            {/* Right — image placeholder */}
            <FadeIn>
              <div className="relative">
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60
                                border border-slate-100 aspect-[4/3] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950" />
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 70%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #60a5fa 0%, transparent 40%)",
                    }}
                  />

                  <div className="relative text-center px-8">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
                      <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-white font-bold text-lg mb-1">Aspire Learning Hub</p>
                    <p className="text-blue-300 text-sm">Mardan, KPK — Campus</p>
                    <p className="text-blue-400/70 text-xs mt-4"></p>
                  </div>

                  <div className="absolute bottom-5 left-5 bg-orange-500 text-white rounded-2xl px-4 py-2.5 shadow-lg shadow-orange-500/30">
                    <p className="font-bold text-sm">Est. 2025</p>
                    <p className="text-orange-100 text-xs">Mardan, Pakistan</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-500/10 rounded-3xl -z-10" />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-900/8 rounded-3xl -z-10" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════ PHILOSOPHY — STEPS ══════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-20">
            <span className="section-label">The Aspire Philosophy</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-4">
              How We Approach Learning
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Five guiding principles that shape every classroom interaction, every lesson plan,
              and every student journey at Aspire.
            </p>
          </FadeUp>

          <div className="space-y-6">
            {PHILOSOPHY_STEPS.map(({ number, Icon, title, desc }, i) => (
              <FadeUp key={number} delay={i * 0.07}>
                <div className="group flex gap-6 md:gap-10 items-start bg-slate-50 hover:bg-white
                               border border-transparent hover:border-orange-200 hover:shadow-lg
                               rounded-3xl p-7 md:p-8 transition-all duration-300 card-lift">
                  <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-white group-hover:bg-orange-50
                                  border border-slate-100 group-hover:border-orange-200 rounded-2xl
                                  flex items-center justify-center shadow-sm transition-all duration-300">
                    <span className="text-slate-300 group-hover:text-orange-400 font-extrabold text-lg transition-colors duration-300">
                      {number}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon />
                      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    </div>
                    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
                  </div>

                  <div className="hidden md:flex flex-shrink-0 items-center">
                    <svg className="w-5 h-5 text-slate-200 group-hover:text-orange-400 transition-colors duration-300"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ WHAT WE OFFER — CARDS ══════════════ */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <span className="section-label">Our Programs</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-4">
              What We Offer
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Carefully structured programmes for every stage of a student&apos;s academic journey —
              from the very first classroom to final board exams and beyond.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-7">
            {PROGRAMS.map(({ badge, badgeColor, title, desc, features, accent, iconBg, iconColor }, i) => (
              <FadeUp key={title} delay={i * 0.1}>
                <div className={`bg-white rounded-3xl p-8 shadow-sm ${accent} card-lift h-full`}>
                  <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                    <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${badgeColor}`}>
                    {badge}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>

                  <ul className="space-y-2.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FOUNDER MESSAGE ══════════════ */}
      <section className="py-28 bg-orange-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-16">
            <span className="section-label">From the Founder</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              A Message of Purpose
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-orange-100 relative">
              {/* Large decorative quotation mark */}
              <div
                className="absolute top-8 left-10 text-orange-200 select-none pointer-events-none"
                aria-hidden="true"
                style={{ fontSize: "8rem", lineHeight: 1, fontFamily: "Georgia, serif" }}
              >
                &ldquo;
              </div>

              <div className="relative">
                <blockquote className="text-slate-700 text-xl md:text-2xl leading-relaxed font-medium
                                       text-center pt-8 md:pt-4 mb-10">
                  At Aspire, we believe every student carries within them the seed of extraordinary
                  potential. Our role is not to hand out answers, but to cultivate the curiosity,
                  discipline, and confidence that allows each young mind to discover their own
                  capability. We are not in the business of producing marks — we are in the business
                  of&nbsp;
                  <span className="text-blue-900 font-bold">transforming potential into success.</span>
                </blockquote>

                <div className="w-16 h-0.5 bg-orange-300 mx-auto mb-8" />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-blue-900/20
                                  ring-2 ring-orange-200 flex-shrink-0">
                    <Image
                      src={instructorImg1}
                      alt="Fatima Khan — Founder & Lead Instructor, Aspire Learning Hub"
                      width={80}
                      height={80}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 text-base">Fatima Khan</p>
                    <p className="text-slate-400 text-sm">Founder &amp; Lead Instructor, Aspire Learning Hub</p>
                    <p className="text-slate-400 text-xs mt-0.5">Mardan, Khyber Pakhtunkhwa</p>
                    <Link
                      href="/instructor"
                      className="inline-flex items-center gap-1 mt-3 text-blue-700 text-sm
                                 font-semibold hover:text-orange-500 transition-colors"
                    >
                      Learn more about the Instructor
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════ STAY UPDATED ══════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <span className="section-label">Stay Connected</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-3">
              Stay Updated
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto mb-10">
              Follow Aspire Learning Hub on social media for updates, resources, and community news.
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

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-28 bg-blue-900 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-800/40 rounded-full blur-3xl pointer-events-none" />

        <FadeUp className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-bold uppercase
                           tracking-widest px-4 py-1.5 rounded-full mb-6">
            Join Aspire Learning Hub
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Build
            <br />
            <span className="text-orange-400">Your Future?</span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Every student has potential. With the right guidance, mentorship, and learning
            environment, that potential becomes lasting success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions" className="btn-orange">
              Apply for Admission
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/40
                         text-white font-semibold rounded-xl hover:border-white hover:bg-white/10
                         transition-all duration-200 text-sm"
            >
              Create Free Account
            </Link>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
