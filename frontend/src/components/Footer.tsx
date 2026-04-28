import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/notes", label: "Notes & Lectures" },
  { href: "/ai-tutor", label: "AI Tutor" },
  { href: "/admissions", label: "Admissions" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16
                      grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center
                            font-extrabold text-white text-lg shadow-md shadow-orange-500/30">
              A
            </div>
            <span className="font-bold text-base text-white">Aspire Learning Hub</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Building Strong Concepts, Not Just Marks. A concept-driven educational
            institute committed to academic excellence in Mardan, KPK.
          </p>
          <p className="text-slate-500 text-xs">
            📍 Mardan, Khyber Pakhtunkhwa, Pakistan
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-bold text-sm text-white uppercase tracking-widest mb-5">
            Quick Links
          </h4>
          <ul className="space-y-2.5">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-slate-400 text-sm hover:text-orange-400 transition-colors
                             flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-slate-600 group-hover:bg-orange-400 rounded-full
                                   transition-colors flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Promise */}
        <div>
          <h4 className="font-bold text-sm text-white uppercase tracking-widest mb-5">
            Our Promise
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            We believe every student has potential. With the right guidance,
            mentorship, and environment, that potential becomes lasting success.
          </p>
          <Link
            href="/admissions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white
                       font-semibold text-sm rounded-xl hover:bg-orange-600 transition-colors
                       shadow-md shadow-orange-500/20"
          >
            Start the Journey
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Aspire Learning Hub · Mardan, KPK · All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Building Strong Concepts, Not Just Marks.
          </p>
        </div>
      </div>
    </footer>
  );
}
