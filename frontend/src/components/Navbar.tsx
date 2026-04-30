"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

const NAV_LINKS = [
  { href: "/", label: "Home", protected: false },
  { href: "/about", label: "About", protected: false },
  { href: "/instructor", label: "Instructor", protected: false },
  { href: "/roadmap", label: "Roadmap", protected: false },
  { href: "/notes", label: "Notes", protected: true },
  { href: "/ai-tutor", label: "AI Tutor", protected: true },
  { href: "/admissions", label: "Admissions", protected: false },
  { href: "/reviews", label: "Reviews", protected: false },
  { href: "/contact", label: "Contact", protected: false },
];

const logoSrc = process.env.NEXT_PUBLIC_LOGO_URL ?? "/assets/logo.svg";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { resetChat } = useChat();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = () => {
    resetChat();
    logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-100"
          : "bg-white border-b border-slate-100"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <Image
              src={logoSrc}
              alt="Aspire Learning Hub logo"
              width={60}
              height={60}
              className="rounded-xl"
              priority
              unoptimized={logoSrc.startsWith("http")}
            />
            <div className="hidden sm:block">
              <span className="text-blue-900 font-bold text-base leading-tight block">
                Aspire Learning Hub
              </span>
              <span className="text-slate-400 text-[10px] leading-none tracking-wider uppercase">
                
              </span>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label, protected: isProtected }) => {
              const locked = isProtected && !isAuthenticated && !isLoading;
              const resolvedHref = locked ? `/login?next=${href}` : href;
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={resolvedHref}
                  title={locked ? "Log in to access this feature" : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                              transition-all duration-200
                    ${active
                      ? "text-orange-500 bg-orange-50"
                      : locked
                        ? "text-slate-400 hover:text-blue-900 hover:bg-slate-50"
                        : "text-slate-600 hover:text-blue-900 hover:bg-slate-50"
                    }`}
                >
                  {label}
                  {locked && (
                    <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd" />
                    </svg>
                  )}
                  {active && !locked && (
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop auth ── */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-slate-500 text-sm px-2">
                  Hi, <span className="font-semibold text-blue-900">{user?.full_name.split(" ")[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg
                             hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg
                             hover:text-blue-900 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-bold bg-orange-500 text-white rounded-lg
                             hover:bg-orange-600 active:bg-orange-700 active:scale-95
                             transition-all shadow-md shadow-orange-500/20"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger ── */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu — animated slide-down ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out
                    ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-white border-t border-slate-100 px-4 pb-5 pt-3 space-y-1">
          {NAV_LINKS.map(({ href, label, protected: isProtected }) => {
            const locked = isProtected && !isAuthenticated && !isLoading;
            const resolvedHref = locked ? `/login?next=${href}` : href;
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={resolvedHref}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "text-orange-500 bg-orange-50"
                    : locked
                      ? "text-slate-400 hover:text-blue-900 hover:bg-slate-50"
                      : "text-slate-600 hover:text-blue-900 hover:bg-slate-50"
                  }`}
              >
                {label}
                {locked && (
                  <svg className="w-3.5 h-3.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd" />
                  </svg>
                )}
                {active && !locked && (
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-auto" />
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2.5 px-3 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                Log Out ({user?.full_name.split(" ")[0]})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login"
                  className="py-2.5 px-3 text-sm font-medium text-slate-600 hover:text-blue-900 hover:bg-slate-50 rounded-lg transition-colors">
                  Log In
                </Link>
                <Link href="/signup"
                  className="py-2.5 px-3 text-sm font-bold bg-orange-500 text-white rounded-lg text-center hover:bg-orange-600 active:bg-orange-700 transition-colors">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
