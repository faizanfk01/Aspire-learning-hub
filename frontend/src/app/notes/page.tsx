"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getContent, ContentItem } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  video: "bg-purple-100 text-purple-700",
  article: "bg-green-100 text-green-700",
};

const GRADES = ["", "Play Group", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function NotesPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [grade, setGrade] = useState("");

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
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchContent();
  }, [isAuthenticated, fetchContent]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Notes &amp; Lectures</h1>
          <p className="text-blue-100">Your study materials — organised by grade and subject.</p>
        </div>
      </section>

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

        {/* States */}
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

        {/* Content grid */}
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
    </>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
