"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// ── Animation helpers (match About page) ─────────────────────────────────────
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

// ── Shared checkmark icon ─────────────────────────────────────────────────────
function Check() {
  return (
    <svg
      className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CREDENTIALS = [
  { label: "Matriculation", sub: "The Educators" },
  { label: "F.Sc. Pre-Medical", sub: "Punjab Group of Colleges" },
  { label: "BS Computer Science", sub: "Currently Pursuing" },
];

const EXPERTISE = [
  "Academic Instructor & Subject Mentor",
  "Career Counselor & Student Development Advisor",
  "Educational Program Coordinator",
  "General Secretary — Student Leadership",
  "Campus Ambassador & Student Engagement",
  "Online Learning Mentor & Session Host",
  "Graphic Designing & Educational Content Development",
  "Media Management & Digital Branding",
  "Website Development & Platform Management",
  "AI-Assisted Learning Integration & Student Guidance",
];

const APPROACH = [
  {
    num: "01",
    title: "Personalized Tutoring",
    desc: "Every student receives instruction tailored to their unique learning style, pace, and academic strengths — not a one-size-fits-all model.",
  },
  {
    num: "02",
    title: "Conceptual Teaching",
    desc: "Strong conceptual understanding over rote memorization. Students learn to reason, analyse, and apply — skills that outlast any examination.",
  },
  {
    num: "03",
    title: "Structured Preparation",
    desc: "Organized notes, regular assessments, and targeted exam preparation ensure students are always equipped and confident for their boards.",
  },
  {
    num: "04",
    title: "Career Counseling",
    desc: "Guidance aligned with each student's strengths, interests, and long-term goals — helping them make informed decisions about their academic future.",
  },
  {
    num: "05",
    title: "Safe & Empowering Environment",
    desc: "A respectful, motivating atmosphere where every student — especially girls — is actively encouraged to pursue quality education without barriers.",
  },
  {
    num: "06",
    title: "Technology & AI Integration",
    desc: "Modern educational systems powered by technology and AI-based guidance bring the future of learning into every Aspire classroom today.",
  },
  {
    num: "07",
    title: "Real-World Skill Development",
    desc: "Education beyond textbooks — preparing students for genuine opportunities, evolving industry trends, and the challenges of the modern world.",
  },
];


// ── Page ──────────────────────────────────────────────────────────────────────
export default function InstructorPage() {
  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: text ── */}
            <div>
              <FadeUp delay={0}>
                <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                                text-orange-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  Founder &amp; Lead Instructor
                </div>
              </FadeUp>

              <FadeUp delay={0.08}>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-5">
                  Meet{" "}
                  <span className="text-blue-900">Fatima</span>{" "}
                  <span className="text-orange-500">Khan</span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.14}>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  A passionate educator, mentor, and academic strategist dedicated to
                  transforming how students learn and grow. Her core conviction:{" "}
                  <span className="font-semibold text-slate-700">
                    every student has the potential to excel when provided with the right
                    guidance, strong concepts, and a supportive learning environment.
                  </span>
                </p>
              </FadeUp>

              {/* Academic credentials */}
              <FadeUp delay={0.2}>
                <div className="space-y-3.5 mb-9">
                  {CREDENTIALS.map((c) => (
                    <div key={c.label} className="flex items-start gap-3.5">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-900 rounded-lg
                                      flex items-center justify-center mt-0.5 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{c.label}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{c.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>

              <FadeUp delay={0.26}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/about" className="btn-orange">
                    About Aspire Learning Hub
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/instructor#approach" className="btn-navy">Our Teaching Approach</Link>
                </div>
              </FadeUp>

              <FadeUp delay={0.32}>
                <a
                  href="https://www.linkedin.com/in/fatimakhanfk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 mt-2 text-sm font-semibold
                             text-slate-500 hover:text-[#0077B5] transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg
                                   bg-slate-100 group-hover:bg-[#0077B5]/10 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </span>
                  Connect with Fatima on LinkedIn
                </a>
              </FadeUp>
            </div>

            {/* ── Right: photo ── */}
            <FadeIn>
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Background decorations */}
                  <div className="absolute -inset-5 bg-gradient-to-br from-orange-50 via-orange-50/60
                                  to-blue-50 rounded-3xl -z-10" />
                  <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-orange-500/12 rounded-2xl -z-10" />
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-900/6 rounded-2xl -z-10" />

                  {/* Photo frame */}
                  <div className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-2xl overflow-hidden
                                  shadow-2xl shadow-slate-900/15 border-4 border-white">
                    <Image
                      src="/pic2.jpeg"
                      alt="Fatima Khan — Founder & Lead Instructor, Aspire Learning Hub"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                  </div>

                  {/* Floating identity badge */}
                  <div className="absolute -bottom-5 -left-5 bg-blue-900 text-white
                                  rounded-2xl px-4 py-3 shadow-xl shadow-blue-900/30">
                    <p className="font-bold text-sm leading-tight">Aspire Learning Hub</p>
                    <p className="text-blue-300 text-xs mt-0.5">Founder &amp; Lead Instructor</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════ PROFESSIONAL EXPERTISE ══════════════ */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <span className="section-label">Professional Background</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-4">
              Expertise &amp; Leadership
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A multidisciplinary professional whose career spans teaching, mentorship,
              digital strategy, and educational leadership.
            </p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 md:p-14">
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
                {EXPERTISE.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check />
                    <span className="text-slate-700 text-sm font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════ EDUCATIONAL APPROACH — CARDS ══════════════ */}
      <section id="approach" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <span className="section-label">The Teaching Method</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-4">
              Our Educational{" "}
              <span className="text-blue-900">Approach</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Seven core pillars that shape how every student is guided toward genuine
              understanding and lasting, meaningful success.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {APPROACH.map(({ num, title, desc }, i) => (
              <FadeUp key={num} delay={i * 0.06}>
                <div className="group bg-slate-50 hover:bg-white border border-transparent
                                hover:border-orange-200 hover:shadow-lg rounded-2xl p-7
                                transition-all duration-300 card-lift h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 bg-white group-hover:bg-orange-50 border border-slate-100
                                     group-hover:border-orange-200 rounded-xl flex items-center justify-center
                                     text-slate-300 group-hover:text-orange-400 font-extrabold text-sm
                                     flex-shrink-0 shadow-sm transition-all duration-300">
                      {num}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ GROWTH & VISION ══════════════ */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeUp className="text-center mb-16">
            <span className="section-label">Growth &amp; Vision</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-4">
              Building a Centre of{" "}
              <span className="text-orange-500">Academic Excellence</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Aspire Learning Hub is continuously evolving and expanding — committed to
              making concept-based, personalized education accessible to every student.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-10 items-center">

            {/* Left — active campus card */}
            <FadeUp delay={0.06}>
              <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm card-lift">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center
                                  justify-center shadow-md flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-bold text-slate-900">Mardan</h3>
                      <span className="text-xs font-bold uppercase tracking-wider
                                       px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">Khyber Pakhtunkhwa, Pakistan</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Our founding campus is actively growing as a centre of academic excellence,
                  mentorship, and student development — providing quality, concept-based
                  education to the Mardan student community.
                </p>
              </div>
            </FadeUp>

            {/* Right — vision statement */}
            <FadeUp delay={0.12}>
              <div className="space-y-5">
                <div className="pl-5 border-l-4 border-orange-400">
                  <p className="text-slate-700 font-semibold text-base italic leading-snug">
                    &ldquo;Aspire Learning Hub is continuously evolving and expanding — with a
                    long-term vision for accessible quality education across Pakistan.&rdquo;
                  </p>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Founded in Mardan, Aspire Learning Hub has been growing steadily as a
                  trusted educational institution dedicated to strong conceptual teaching,
                  mentorship, and student development. The vision is clear: to reach a wider
                  student community and bring the same quality of personalized, concept-driven
                  learning to students across the country.
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  With each passing year, more students benefit from the structured,
                  supportive, and technology-integrated environment that defines the
                  Aspire experience — and that foundation continues to strengthen.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════ FOUNDER QUOTE ══════════════ */}
      <section className="py-28 bg-orange-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-200/40 rounded-full
                        blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-900/5 rounded-full
                        blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-14">
            <span className="section-label">Message to Parents &amp; Students</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              A Word from Fatima
            </h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-orange-100 relative">
              {/* Decorative quotation mark */}
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
                  Education is not just about marks — it is about building understanding,
                  confidence, character, and direction. My mission is to ensure every student
                  receives quality teaching, personal mentorship, and a clear pathway toward{" "}
                  <span className="text-blue-900 font-bold">meaningful success.</span>
                </blockquote>

                <div className="w-16 h-0.5 bg-orange-300 mx-auto mb-8" />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-blue-900/20
                                  ring-2 ring-orange-200 flex-shrink-0">
                    <Image
                      src="/pic2.jpeg"
                      alt="Fatima Khan"
                      width={80}
                      height={80}
                      className="object-cover object-top w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 text-base">Fatima Khan</p>
                    <p className="text-slate-400 text-sm">
                      Founder &amp; Lead Instructor, Aspire Learning Hub
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">Mardan, Khyber Pakhtunkhwa</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.18} className="mt-10 text-center">
            <p className="text-slate-500 text-base italic font-medium max-w-2xl mx-auto leading-relaxed">
              &ldquo;At Aspire Learning Hub, students are not just taught — they are guided,
              inspired, and prepared for life.&rdquo;
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-28 bg-blue-900 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full
                        blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-800/40 rounded-full
                        blur-3xl pointer-events-none" />

        <FadeUp className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-bold uppercase
                           tracking-widest px-4 py-1.5 rounded-full mb-6">
            Begin Your Journey
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Learn with
            <br />
            <span className="text-orange-400">Aspire?</span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join a community of students building strong concepts, developing real skills,
            and achieving meaningful success under expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions" className="btn-orange">
              Apply for Admission
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/40
                         text-white font-semibold rounded-xl hover:border-white hover:bg-white/10
                         transition-all duration-200 text-sm"
            >
              Learn About Aspire
            </Link>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
