"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/notes", label: "Notes" },
  { href: "/ai-tutor", label: "AI Chatbot" },
  { href: "/admissions", label: "Admissions" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="Aspire Learning Hub logo"
              width={38}
              height={38}
              className="rounded-lg"
              priority
            />
            <span className="text-white font-bold text-base sm:text-lg leading-tight hidden sm:block">
              Aspire Learning Hub
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive(href)
                    ? "text-orange-400 border-b-2 border-orange-400"
                    : "text-white hover:text-orange-300"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop auth ── */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-blue-100 text-sm">
                  Hi, {user?.full_name.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 text-sm border border-white/60 text-white rounded-lg
                             hover:border-orange-400 hover:text-orange-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm border border-white/60 text-white rounded-lg
                             hover:border-orange-400 hover:text-orange-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 text-sm bg-white text-blue-700 font-semibold rounded-lg
                             hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger ── */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden bg-blue-800 border-t border-blue-600 px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${isActive(href) ? "text-orange-400 bg-blue-700" : "text-white hover:text-orange-300 hover:bg-blue-700"}`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-blue-600 space-y-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 px-3 text-sm text-white hover:text-orange-300"
              >
                Logout ({user?.full_name.split(" ")[0]})
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block py-2 px-3 text-sm text-white hover:text-orange-300">Login</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="block py-2 px-3 text-sm text-white hover:text-orange-300">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
