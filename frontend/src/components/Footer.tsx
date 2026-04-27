import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="font-bold text-lg mb-2">Aspire Learning Hub</h3>
          <p className="text-blue-200 text-sm leading-relaxed">
            Building Strong Concepts, Not Just Marks. A concept-based educational
            institute committed to academic excellence.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm text-blue-200">
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About Us" },
              { href: "/notes", label: "Notes & Lectures" },
              { href: "/ai-tutor", label: "AI Chatbot" },
              { href: "/admissions", label: "Admissions" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-orange-300 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact / tagline */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Our Promise</h4>
          <p className="text-blue-200 text-sm leading-relaxed">
            We believe every student has potential. With the right guidance,
            mentorship, and environment, that potential becomes success.
          </p>
        </div>
      </div>

      <div className="border-t border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-blue-300">
          © 2025 Aspire Learning Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
