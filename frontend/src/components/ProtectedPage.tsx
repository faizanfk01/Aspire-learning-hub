"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedPage({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-900 border-t-orange-500 rounded-full animate-spin
                          border-[3px]" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <RestrictedAccess />;
  }

  return <>{children}</>;
}

function RestrictedAccess() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center
                    bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-4 py-16">
      <div className="text-center max-w-lg w-full">

        {/* Icon cluster */}
        <div className="relative inline-flex items-center justify-center mb-10">
          {/* Glow ring */}
          <div className="absolute w-36 h-36 bg-blue-900/8 rounded-full blur-2xl" />
          {/* Main icon */}
          <div className="relative w-24 h-24 bg-blue-900 rounded-3xl flex items-center justify-center
                          shadow-xl shadow-blue-900/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {/* Orange pip */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full
                            flex items-center justify-center shadow-md shadow-orange-500/30">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Copy */}
        <p className="section-label mb-3">Members Only</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
          Unlock Your Personalized Mentor
        </h1>
        <p className="text-blue-900 font-semibold text-sm mb-2">
          Aspire Learning Hub · Mardan, KPK
        </p>
        <p className="text-slate-500 text-base leading-relaxed mb-10 max-w-md mx-auto">
          <span className="font-semibold text-slate-700">Building Strong Concepts, Not Just Marks.</span>
          {" "}Log in to join the Aspire community and unlock your AI Tutor, class notes, study materials, and more.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/signup" className="btn-orange justify-center text-base px-8 py-4">
            Join Aspire Learning Hub
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/login" className="btn-navy justify-center text-base px-8 py-4">
            Already a student? Log In
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["AI Tutor", "Grade Notes", "Lecture PDFs", "Session Memory", "All Subjects", "24 / 7 Access"].map((f) => (
            <span key={f}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-xs
                         rounded-full shadow-sm font-medium">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
