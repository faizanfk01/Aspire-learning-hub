const offerings = [
  "Tuition Classes (Play Group to Grade 7)",
  "Full Academic Programs (Grade 8 to Grade 12)",
  "Concept-Based Learning Approach",
  "Experienced & Dedicated Teachers",
  "Personalized Student Guidance",
  "Regular Assessments & Progress Tracking",
  "Career Counseling & Academic Mentorship",
  "Skill Development Sessions",
  "A Supportive Learning Environment",
];

const philosophy = [
  "Building strong concepts",
  "Encouraging curiosity and independent thinking",
  "Improving academic confidence",
  "Creating disciplined study habits",
  "Preparing students for long-term success, not just short-term results",
];

const whyUs = [
  "Quality education with individual attention",
  "Structured and organized learning plans",
  "Focus on conceptual clarity",
  "Safe, motivating, and growth-oriented environment",
  "Strong teacher-student communication",
  "Commitment to excellence",
];

export default function AboutPage() {
  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Learn about our mission, vision, and what makes Aspire Learning Hub unique.
          </p>
        </div>
      </section>

      {/* ── Who we are ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-5 border-l-4 border-orange-500 pl-4">
            Who We Are
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Aspire Learning Hub is a concept-based educational institute committed to building
            strong academic foundations and helping students achieve excellence through quality
            learning. Our focus is not just on marks, but on developing understanding, confidence,
            critical thinking, and long-term academic growth. At Aspire Learning Hub, we believe
            every student has potential — with the right guidance, mentorship, and learning
            environment, that potential can be transformed into success.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-blue-700">
            <div className="text-3xl mb-3">🎯</div>
            <h2 className="text-xl font-bold text-blue-700 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To provide high-quality, accessible, and concept-driven education that empowers
              students academically, intellectually, and personally.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-orange-500">
            <div className="text-3xl mb-3">🔭</div>
            <h2 className="text-xl font-bold text-blue-700 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become a trusted learning platform known for academic excellence, student
              development, and innovative teaching methods that prepare learners for both
              exams and life.
            </p>
          </div>
        </div>
      </section>

      {/* ── What we offer ────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-8 border-l-4 border-orange-500 pl-4">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {offerings.map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-orange-500 font-bold text-lg mt-0.5">✓</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy & Why us ──────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-6 border-l-4 border-orange-500 pl-4">
              Our Teaching Philosophy
            </h2>
            <ul className="space-y-4">
              {philosophy.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    →
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-6 border-l-4 border-orange-500 pl-4">
              Why Parents &amp; Students Choose Aspire
            </h2>
            <ul className="space-y-4">
              {whyUs.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
