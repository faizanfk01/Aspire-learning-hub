import Link from "next/link";

const highlights = [
  {
    icon: "📚",
    title: "Tuition Classes",
    body: "Play Group to Grade 7 — focused, personalized attention in small groups.",
  },
  {
    icon: "🎓",
    title: "Full Academic Programs",
    body: "Grade 8 to Grade 12 — complete syllabi with structured monthly assessments.",
  },
  {
    icon: "💡",
    title: "Concept-Based Learning",
    body: "We build understanding first — marks follow naturally when concepts are clear.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-56 h-56 bg-orange-500/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <span className="inline-block bg-orange-500/20 text-orange-300 text-sm font-semibold px-4 py-1 rounded-full mb-6 border border-orange-400/30">
            Welcome to Aspire Learning Hub
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Building Strong Concepts,
            <br className="hidden sm:block" />
            <span className="text-orange-400"> Not Just Marks.</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A concept-driven educational institute helping students achieve excellence
            through quality learning, experienced teachers, and personalised guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admissions"
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl
                         border-2 border-orange-500 hover:bg-orange-600 hover:border-orange-600
                         transition-all duration-200 text-base shadow-lg shadow-orange-500/20"
            >
              Apply for Admission
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl
                         border-2 border-white/50 hover:border-orange-400 hover:text-orange-300
                         transition-all duration-200 text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Highlights ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-3">What We Offer</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything a student needs — from foundational tuition to AI-powered study assistance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100
                           hover:border-orange-400 hover:shadow-md transition-all duration-200"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats banner ─────────────────────────────────────────────────── */}
      <section className="bg-white py-14 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "8+", label: "Grades Covered" },
            { number: "100%", label: "Concept-First Teaching" },
            { number: "AI", label: "Powered Tutor" },
            { number: "∞", label: "Student Potential" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-extrabold text-blue-700 mb-1">{stat.number}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="bg-blue-700 py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your Academic Journey?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join Aspire Learning Hub — where every student&apos;s potential becomes success.
          </p>
          <Link
            href="/admissions"
            className="inline-block px-10 py-4 bg-white text-blue-700 font-bold rounded-xl
                       hover:bg-orange-50 hover:text-orange-600 border-2 border-white
                       hover:border-orange-400 transition-all duration-200 text-base"
          >
            Apply Now →
          </Link>
        </div>
      </section>
    </>
  );
}
