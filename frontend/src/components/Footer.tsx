import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/roadmap", label: "Academic Roadmap" },
  { href: "/notes", label: "Notes & Lectures" },
  { href: "/ai-tutor", label: "AI Tutor" },
  { href: "/admissions", label: "Admissions" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

const logoSrc = process.env.NEXT_PUBLIC_LOGO_URL ?? "/assets/logo.svg";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16
                      grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-4 group">
            {/* This replaces the orange 'A' box and the span text */}
            <Image
              src={logoSrc}
              alt="Aspire Learning Hub Logo"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
            <span className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors">
              Aspire Learning Hub
            </span>
          </Link>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            Building Strong Concepts, Not Just Marks. A concept-driven educational
            institute committed to academic excellence in Mardan, KPK.
          </p>

          {/* Social links */}
          <div className="flex items-center flex-wrap gap-2.5">
            <a
              href="https://www.instagram.com/aspire__learning__hub?igsh=MWlsOXhkbDM0dmMyaQ=="
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800
                         text-slate-400 hover:bg-pink-500/20 hover:text-pink-400 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61580876798186"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800
                         text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb6fdcwDDmFegq9wXx27"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Updates"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800
                         text-slate-400 hover:bg-green-500/20 hover:text-green-400 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <a
              href="https://chat.whatsapp.com/KkRSznSot4yGG19yXRkJTP"
              target="_blank"
              rel="noopener noreferrer"
              title="Join WhatsApp Community"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800
                         text-slate-400 hover:bg-green-500/20 hover:text-green-400 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
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
            © {new Date().getFullYear()} Aspire Learning Hub · All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Building Strong Concepts, Not Just Marks.
          </p>
        </div>
      </div>
    </footer>
  );
}
