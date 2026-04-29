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

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconBook() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function IconBeaker() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function Check() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── Data types ────────────────────────────────────────────────────────────────
interface Phase {
  number: string;
  title: string;
  timeline: string;
  Icon: React.FC;
  deliverables: string[];
  focus?: string[];         // Marks-Grabbing Focus — Matric only
  outcome?: string;
  rounds?: { label: string; points: string[] }[];
}

// ── MATRIC data (from context_matric.txt) ─────────────────────────────────────
const MATRIC_PHASES: Phase[] = [
  {
    number: "01",
    title: "Complete Course Coverage & Concept Building",
    timeline: "May – October · 6 Months",
    Icon: IconBook,
    deliverables: [
      "100% syllabus completion of all core subjects",
      "Concept-based teaching with deep understanding of every chapter",
      "Chapter-wise notes, summaries, and practice sheets",
      "Regular class tests and progress tracking",
      "2 Complete Revision Rounds during course coverage",
      "Diagram Practice Sessions — labeled diagrams, step-by-step drawing methods, neat presentation, and board-standard explanation techniques",
      "High-marking question identification and targeted preparation",
    ],
    focus: [
      "How to write headings professionally",
      "Key-point formatting that examiners prefer",
      "Highlighting techniques for better presentation",
      "Answer structuring for maximum marks",
      "Smart memory techniques for long questions",
    ],
    outcome:
      "By October, students complete the full syllabus with strong concepts, polished diagrams, and two full revisions, staying well ahead academically.",
  },
  {
    number: "02",
    title: "Quarter Test Series & Smart Revision",
    timeline: "November – January · 3 Months",
    Icon: IconClipboard,
    deliverables: [
      "2 Complete Series of Quarter Tests",
      "SLO-based board pattern practice",
      "Topic-wise targeted revision",
      "Mistake analysis and improvement sessions",
      "Diagram repetition practice for science subjects",
      "Heading and subheading writing practice for long-answer questions",
      "Proper attempting method training — what to write first, how to structure answers, time division",
    ],
    focus: [
      "Writing examiner-friendly answers",
      "Strong introductions and concise conclusions",
      "Using keywords that secure marks",
      "Proper margin, spacing, and answer presentation",
      "Time management in exam halls",
    ],
    outcome:
      "Students develop paper-solving confidence while improving weak areas and mastering answer presentation.",
  },
  {
    number: "03",
    title: "Half-Length Papers (HLPs) — Exam Conditioning",
    timeline: "February",
    Icon: IconDocument,
    deliverables: [
      "Half-Length Paper Series (HLPs)",
      "Board-style timed paper practice",
      "High-weightage chapter revision",
      "Diagram accuracy checks",
      "Writing speed and neatness improvement",
      "Presentation polishing sessions",
    ],
    focus: [
      "Attempting high-scoring sections strategically",
      "Stepwise numerical solving method",
      "Perfect diagram labeling style",
      "Neat headings and clean formatting",
      "Smart revision strategies before exams",
    ],
    outcome:
      "Students gain speed, clarity, and professional exam-writing habits.",
  },
  {
    number: "04",
    title: "Full-Length Paper Series (FLPs) — Final Mastery",
    timeline: "March",
    Icon: IconAward,
    deliverables: [],
    rounds: [
      {
        label: "Round 1 · March 1–15",
        points: [
          "Complete full-length papers of all subjects",
          "Real board exam environment",
          "Performance review and correction",
          "Concept polishing and weak area revision",
          "Final diagram refinement",
        ],
      },
      {
        label: "Round 2 · March 15–27",
        points: [
          "Second full-length paper cycle",
          "Advanced paper attempting strategy",
          "Final answer presentation training",
          "Confidence-building sessions",
          "Last-stage conceptual strengthening",
        ],
      },
    ],
  },
];

const MATRIC_OUTCOMES = [
  "1 Full Course Completion",
  "2 Complete Revision Rounds",
  "2 Quarter Test Series",
  "1 Half-Length Paper Series",
  "2 Full-Length Paper Series",
  "Continuous Diagram Practice",
  "Heading, Presentation & Answer Writing Training",
  "Marks-Grabbing Attempting Strategy",
];

const MATRIC_FINAL_CHECKLIST = [
  "Crystal-clear concepts",
  "Full SLO-based preparation",
  "Strong diagram practice",
  "Professional answer presentation",
  "Effective headings and structured writing",
  "Proper paper-attempting methods",
  "Time management mastery",
  "Personalized mentorship and guidance",
];

// ── FSC data (from context_fsc.txt) ──────────────────────────────────────────
const FSC_PHASES: Phase[] = [
  {
    number: "01",
    title: "Complete Course Coverage + MDCAT Foundation",
    timeline: "July – December · 6 Months",
    Icon: IconBeaker,
    deliverables: [
      "100% FSC syllabus completion",
      "Deep conceptual teaching aligned with Board and MDCAT standards",
      "MDCAT-style MCQs integrated with every chapter",
      "Chapter-wise notes, summaries, and revision sheets",
      "Daily quizzes and concept checks",
      "Numerical problem-solving sessions",
      "Diagram and labeling mastery practice",
      "2 Complete Revision Rounds during course completion",
      "Dedicated MDCAT Book Practice from standard preparation books and chapter-wise MCQ banks",
      "Topic-wise problem-solving from recommended MDCAT resources",
    ],
    outcome:
      "Students build a strong conceptual base while developing familiarity with real MDCAT-level book questions and competitive practice material.",
  },
  {
    number: "02",
    title: "Quarter Test Series + Book Practice Reinforcement",
    timeline: "January – February",
    Icon: IconClipboard,
    deliverables: [
      "2 Complete Series of Quarter Tests",
      "Regular MDCAT book solving sessions",
      "Chapter-wise MCQ workbook practice",
      "Conceptual problem drills from advanced prep books",
      "Weak topic reinforcement using targeted exercises",
      "Diagram repetition and concept revision",
    ],
    outcome:
      "Students strengthen concepts through repeated exposure to MDCAT-standard practice books, improving speed, confidence, and question handling.",
  },
  {
    number: "03",
    title: "Half-Length Papers + Advanced MDCAT Practice",
    timeline: "March",
    Icon: IconDocument,
    deliverables: [
      "Half-Length Paper Series (HLPs)",
      "MDCAT book mock sections",
      "Timed MCQ solving practice",
      "Formula and concept revision drills",
      "Mistake analysis with correction planning",
      "Advanced concept exercises from selected MDCAT prep material",
    ],
    outcome:
      "Students learn how to tackle high-level MDCAT questions under time pressure.",
  },
  {
    number: "04",
    title: "Full-Length Papers + Final MDCAT Excellence Track",
    timeline: "April – Early May",
    Icon: IconAward,
    deliverables: [
      "2 Rounds of Full-Length Papers",
      "Full MDCAT-style mock testing",
      "Revision from key MDCAT preparation books",
      "High-yield chapter practice sets",
      "Personalized performance analysis and improvement strategy",
    ],
  },
];

const FSC_ADVANTAGE = [
  "Dedicated MDCAT concept sessions",
  "Regular practice from MDCAT preparation books and question banks",
  "Daily MCQ drills and analytical reasoning practice",
  "High-yield Biology, Chemistry, and Physics notes",
  "Performance tracking and merit analysis",
  "Personalized counseling for medical career pathways",
  "Smart test-taking strategies for maximum score improvement",
];

// ── Phase card component ──────────────────────────────────────────────────────
function PhaseCard({ phase, variant }: { phase: Phase; variant: "matric" | "fsc" }) {
  const isMatric = variant === "matric";
  const panelBg = isMatric ? "bg-blue-900" : "bg-slate-800";
  const iconHover = isMatric
    ? "group-hover:bg-orange-50 group-hover:border-orange-100"
    : "group-hover:bg-blue-50 group-hover:border-blue-100";
  const checkColor = isMatric ? "text-orange-500" : "text-blue-500";
  const focusBg = "bg-orange-50 border-orange-100";
  const outcomeBorder = isMatric ? "border-orange-300" : "border-blue-300";

  return (
    <div className="group flex overflow-hidden rounded-2xl border border-slate-100 shadow-sm
                   hover:border-slate-200 hover:shadow-md transition-all duration-300">
      {/* Left panel: phase number */}
      <div className={`w-20 sm:w-24 flex-shrink-0 ${panelBg} flex flex-col items-center justify-center py-8 gap-1`}>
        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Phase</span>
        <span className="text-white font-black text-3xl sm:text-4xl leading-none">{phase.number}</span>
      </div>

      {/* Right panel: content */}
      <div className="flex-1 bg-white p-6 sm:p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-100
                             flex items-center justify-center flex-shrink-0 mt-0.5
                             ${iconHover} transition-colors ${checkColor}`}>
              <phase.Icon />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug pt-1.5">
              {phase.title}
            </h3>
          </div>
          <span className="inline-flex items-center self-start sm:self-auto flex-shrink-0 text-xs
                           font-semibold text-slate-500 bg-slate-50 border border-slate-200
                           rounded-full px-3 py-1 whitespace-nowrap">
            {phase.timeline}
          </span>
        </div>

        {/* Rounds layout (Matric Phase 4) */}
        {phase.rounds ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {phase.rounds.map((round) => (
              <div key={round.label} className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3.5">
                  {round.label}
                </p>
                <ul className="space-y-2.5">
                  {round.points.map((p) => (
                    <li key={p} className={`flex items-start gap-2.5 text-sm text-slate-600 ${checkColor}`}>
                      <Check />
                      <span className="text-slate-600">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Deliverables */}
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-5">
              {phase.deliverables.map((d) => (
                <li key={d} className={`flex items-start gap-2.5 text-sm ${checkColor}`}>
                  <Check />
                  <span className="text-slate-600">{d}</span>
                </li>
              ))}
            </ul>

            {/* Marks-Grabbing Focus (Matric only) */}
            {phase.focus && (
              <div className={`border rounded-xl p-4 mb-4 ${focusBg}`}>
                <p className="text-orange-600 font-bold text-xs uppercase tracking-widest mb-3">
                  Marks-Grabbing Focus
                </p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {phase.focus.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <ArrowRight />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outcome */}
            {phase.outcome && (
              <p className={`text-sm text-slate-500 italic border-l-2 ${outcomeBorder} pl-3 leading-relaxed`}>
                {phase.outcome}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                            text-orange-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              A Structured Path to Excellence
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.06] mb-5">
              The Aspire{" "}
              <span className="text-blue-900">Academic</span>
              <br />
              <span className="text-orange-500">Roadmap.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mb-10">
              Two complete academic programs — Matriculation and F.Sc. Pre-Medical / MDCAT —
              each structured as a phase-by-phase plan built for maximum marks and competitive success.
            </p>
          </FadeUp>

          {/* Anchor jump links */}
          <FadeUp delay={0.22}>
            <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 gap-1.5">
              <a
                href="#matric"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white
                           font-semibold text-sm rounded-xl hover:bg-orange-600 transition-colors
                           shadow-sm shadow-orange-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Matriculation
              </a>
              <a
                href="#fsc"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white
                           font-semibold text-sm rounded-xl hover:bg-blue-800 transition-colors
                           shadow-sm shadow-blue-900/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                F.Sc. &amp; MDCAT
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════ MATRICULATION ══════════════════════ */}
      <section id="matric" className="scroll-mt-20">
        {/* Section header */}
        <div className="bg-white border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <FadeIn>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <span className="inline-flex items-center bg-orange-50 border border-orange-200
                                   text-orange-600 rounded-full px-3 py-1 text-xs font-bold uppercase
                                   tracking-widest mb-3">
                    Chapter One
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    Matriculation Roadmap
                  </h2>
                  <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
                    A high-performance academic roadmap designed to maximize marks through concept
                    clarity, repeated revision, strategic paper practice, diagram mastery, and
                    exam-attempting techniques that help students secure top results.
                  </p>
                </div>
                <div className="flex-shrink-0 w-24 h-24 bg-orange-50 border border-orange-100
                                rounded-2xl flex flex-col items-center justify-center text-center">
                  <p className="text-orange-500 text-4xl font-black leading-none">4</p>
                  <p className="text-slate-400 text-xs font-medium mt-1">Phases</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Phase cards */}
        <div className="bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-5">
              {MATRIC_PHASES.map((phase, i) => (
                <FadeUp key={phase.number} delay={i * 0.07}>
                  <PhaseCard phase={phase} variant="matric" />
                </FadeUp>
              ))}
            </div>
          </div>
        </div>

        {/* Outcome summary */}
        <div className="bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FadeUp>
              <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-orange-500 px-8 py-6">
                  <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">
                    Total Student Preparation
                  </p>
                  <h3 className="text-2xl font-extrabold text-white">
                    Final Result — 6+ Complete Book Revisions + Exam Mastery
                  </h3>
                </div>
                <div className="bg-white px-8 py-7">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Every Student Receives
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-6">
                    {MATRIC_OUTCOMES.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium text-orange-500">
                        <Check />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Students Appear in Exams With
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                      {MATRIC_FINAL_CHECKLIST.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-slate-600 text-orange-400">
                          <Check />
                          <span className="text-slate-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm text-slate-500 italic border-l-2 border-orange-300 pl-3">
                      Higher confidence, stronger concepts, and maximum scoring potential.
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════ SECTION DIVIDER ══════════════════════ */}
      <div id="fsc" className="bg-slate-900 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <span className="inline-flex items-center bg-white/10 text-blue-300 rounded-full
                                 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
                  Chapter Two
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  F.Sc. Pre-Medical &amp; MDCAT Roadmap
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                  Designed not only for excellent board results but for competitive exam success.
                  Board preparation and MDCAT-oriented concept building run together in a single
                  structured and effective program.
                </p>
              </div>
              <div className="flex-shrink-0 w-24 h-24 bg-white/5 border border-white/10
                              rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-blue-300 text-4xl font-black leading-none">4</p>
                <p className="text-slate-400 text-xs font-medium mt-1">Phases</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ══════════════════════ FSC SECTION ══════════════════════ */}
      <section className="bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-5">
            {FSC_PHASES.map((phase, i) => (
              <FadeUp key={phase.number} delay={i * 0.07}>
                <PhaseCard phase={phase} variant="fsc" />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FSC: Aspire MDCAT Advantage */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeUp>
            <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-blue-900 px-8 py-6">
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">
                  The Aspire Difference
                </p>
                <h3 className="text-2xl font-extrabold text-white">
                  Aspire MDCAT Advantage
                </h3>
                <p className="text-blue-200 text-sm mt-2">
                  Board Excellence + Competitive Edge + MDCAT Book Mastery
                </p>
              </div>
              <div className="bg-white px-8 py-7">
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                  {FSC_ADVANTAGE.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-blue-500">
                      <Check />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-500 italic border-l-2 border-blue-300 pl-3 leading-relaxed">
                    At Aspire Learning Hub, students do not rely only on classroom lectures — they
                    gain extensive practice through MDCAT books, MCQ banks, mock tests, and
                    concept-driven guidance, preparing them for top performance.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-blue-900 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-800/50 rounded-full blur-3xl pointer-events-none" />

        <FadeUp className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 text-orange-300 text-xs font-bold uppercase
                           tracking-widest px-4 py-1.5 rounded-full mb-6">
            Start Your Journey
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Begin
            <br />
            <span className="text-orange-400">the Aspire Roadmap?</span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Every great academic result starts with the right plan and the right guidance.
            Apply for admission and let us build your personalised path to success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions" className="btn-orange">
              Apply for Admission
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5
                         border-2 border-white/30 text-white font-semibold rounded-xl
                         hover:border-white hover:bg-white/10 transition-all text-sm"
            >
              Learn About Aspire
            </Link>
          </div>
        </FadeUp>
      </section>

    </div>
  );
}
