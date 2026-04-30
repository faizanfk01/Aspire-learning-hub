"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getContent, ContentItem } from "@/lib/api";
import ProtectedPage from "@/components/ProtectedPage";

const TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  video: "bg-purple-100 text-purple-700",
  article: "bg-green-100 text-green-700",
};

const GRADES = ["", "Play Group", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function NotesPage() {
  // isLoading here is the AuthContext loading flag — same one ProtectedPage uses.
  // We read it explicitly so the RBAC check never runs before auth has initialised.
  const { token, user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

  const [content, setContent]               = useState<ContentItem[]>([]);
  const [fetching, setFetching]             = useState(false);
  const [error, setError]                   = useState("");
  const [grade, setGrade]                   = useState("");
  // True while we are re-fetching the user's admission status from the server.
  // Showing a spinner here (not the AdmissionRequired wall) prevents admitted
  // users with a stale cache from seeing a misleading lock screen for 30-60 s.
  const [admissionChecking, setAdmissionChecking] = useState(false);

  const isAdmitted = user?.role === "admin" || user?.is_admitted === true;
  const refreshedRef = useRef(false);

  // ── Clear all local state on logout ──────────────────────────────────────────
  // Even though logout() navigates away (unmounting the page), this guard
  // makes state isolation explicit and handles edge cases (e.g. programmatic
  // token expiry without navigation).
  useEffect(() => {
    if (!isAuthenticated) {
      setContent([]);
      setError("");
      setGrade("");
      refreshedRef.current = false; // allow re-check on next login
    }
  }, [isAuthenticated]);

  // ── Admission status re-check ─────────────────────────────────────────────
  // Runs only after AuthContext has finished loading (authLoading=false) so we
  // never fire a network request before we know the cached token / user state.
  // If the cached is_admitted is false (stale data), we silently re-verify with
  // the server and show a spinner in place of the lock wall while we wait.
  useEffect(() => {
    if (authLoading || !isAuthenticated || isAdmitted || refreshedRef.current) return;
    refreshedRef.current = true;
    setAdmissionChecking(true);
    refreshUser().finally(() => setAdmissionChecking(false));
  }, [authLoading, isAuthenticated, isAdmitted, refreshUser]);

  // ── Content fetch ─────────────────────────────────────────────────────────
  const fetchContent = useCallback(async () => {
    if (!token) return;
    setFetching(true);
    setError("");
    try {
      const data = await getContent(token, grade ? { grade } : undefined);
      setContent(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setFetching(false);
    }
  }, [token, grade]);

  useEffect(() => {
    if (isAuthenticated && isAdmitted) fetchContent();
  }, [isAuthenticated, isAdmitted, fetchContent]);

  return (
    <ProtectedPage>
      <>
        {/* ── Page header — always visible once authenticated ── */}
        <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Notes &amp; Lectures</h1>
            <p className="text-blue-100">Your study materials — organised by grade and subject.</p>
          </div>
        </section>

        {/* ── Access gate ───────────────────────────────────────────────────── */}

        {/* Spinner while we verify admission status with the server.
            This replaces the AdmissionRequired lock wall during the check so
            admitted users with a stale cache see a spinner, not a false lock. */}
        {admissionChecking ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-[3px] border-blue-700 border-t-transparent
                            rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Checking your admission status…</p>
          </div>

        ) : !isAdmitted ? (
          <AdmissionRequired />

        ) : (
          <section className="py-10 max-w-7xl mx-auto px-4">
            {/* Filter bar */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-sm font-medium text-gray-600">Filter by Grade:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g ? `Grade ${g}` : "All Grades"}</option>
                ))}
              </select>
              <button
                onClick={fetchContent}
                className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg
                           hover:bg-blue-800 transition-colors"
              >
                Refresh
              </button>
            </div>

            {fetching && <Spinner />}

            {!fetching && error && (
              <div className="text-center py-16 text-red-500">{error}</div>
            )}

            {!fetching && !error && content.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-2xl mb-2">📂</p>
                <p className="font-medium">No materials available yet.</p>
                <p className="text-sm mt-1">Your teacher will upload content here soon.</p>
              </div>
            )}

            {!fetching && !error && content.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6
                               hover:border-orange-400 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase
                          ${TYPE_COLORS[item.content_type] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {item.content_type}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        Grade {item.target_grade}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                    )}
                    <a
                      href={item.file_source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700
                                 hover:text-orange-500 transition-colors mt-1"
                    >
                      Open Material
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </>
    </ProtectedPage>
  );
}

function AdmissionRequired() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center
                    bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-4 py-16">
      <div className="text-center max-w-lg w-full">

        {/* Icon cluster */}
        <div className="relative inline-flex items-center justify-center mb-10">
          <div className="absolute w-36 h-36 bg-orange-500/8 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 bg-blue-900 rounded-3xl flex items-center justify-center
                          shadow-xl shadow-blue-900/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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

        <p className="section-label mb-3">Admission Required</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
          Notes &amp; Lectures are Locked
        </h1>
        <p className="text-blue-900 font-semibold text-sm mb-2">
          Aspire Learning Hub · Mardan, KPK
        </p>
        <p className="text-slate-500 text-base leading-relaxed mb-10 max-w-md mx-auto">
          This section is reserved for admitted students. Please complete your admission
          to access these resources. In the meantime, you can still use the{" "}
          <span className="font-semibold text-slate-700">AI Tutor</span> for free.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/admissions" className="btn-orange justify-center text-base px-8 py-4">
            Apply for Admission
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/ai-tutor" className="btn-navy justify-center text-base px-8 py-4">
            Use AI Tutor Instead
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {["Grade Notes", "Lecture PDFs", "All Subjects", "Organised by Grade"].map((f) => (
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

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
