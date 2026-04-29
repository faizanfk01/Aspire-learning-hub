"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPendingReviews, approveReview, deleteReview, ReviewRead, ApiError } from "@/lib/api";
import { useToast, Toaster } from "@/components/admin/Toast";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-orange-400" : "text-slate-200"}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const { toasts, toast } = useToast();
  const [reviews, setReviews] = useState<ReviewRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!token) return;
    getPendingReviews(token)
      .then(setReviews)
      .catch(() => toast("error", "Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [token]);

  const withAct = async (
    id: number,
    fn: () => Promise<unknown>,
    successMsg: string
  ) => {
    setActing((p) => new Set(p).add(id));
    try {
      await fn();
      setReviews((p) => p.filter((r) => r.id !== id));
      toast("success", successMsg);
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActing((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Review Moderation</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {reviews.length > 0
            ? <span className="text-amber-600 font-medium">{reviews.length} review{reviews.length !== 1 ? "s" : ""} awaiting approval</span>
            : "No pending reviews — inbox is clear"
          }
        </p>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-2.5 bg-slate-50 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 bg-slate-50 rounded" />
                <div className="h-2.5 bg-slate-50 rounded w-4/5" />
                <div className="h-2.5 bg-slate-50 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-900 font-semibold mb-1">All caught up</p>
          <p className="text-slate-400 text-sm">No reviews pending approval.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map((r) => {
            const initials = r.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
                {/* Avatar + meta */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center
                                  justify-center font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm leading-tight truncate">{r.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${r.role === "parent" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-600"}`}>
                        {r.role === "parent" ? "Parent" : "Student"}
                      </span>
                      <span className="text-xs text-slate-400 truncate">{r.program}</span>
                    </div>
                  </div>
                </div>

                {/* Rating + date */}
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleDateString("en-PK", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>

                {/* Review text */}
                <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-4">{r.review_text}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    disabled={acting.has(r.id)}
                    onClick={() => withAct(r.id, () => approveReview(r.id, token!), `${r.name}'s review approved`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700
                               text-xs font-semibold rounded-lg hover:bg-green-100 disabled:opacity-40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button
                    disabled={acting.has(r.id)}
                    onClick={() => {
                      if (!window.confirm(`Delete ${r.name}'s review?`)) return;
                      withAct(r.id, () => deleteReview(r.id, token!), "Review deleted");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600
                               text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toaster toasts={toasts} />
    </div>
  );
}
