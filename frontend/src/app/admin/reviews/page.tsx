"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllAdminReviews,
  approveReview,
  declineReview,
  deleteReview,
  clearDeclinedReviews,
  ReviewRead,
  ApiError,
} from "@/lib/api";
import { useToast, Toaster } from "@/components/admin/Toast";

type Tab = "pending" | "approved" | "declined";

const TABS: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Live" },
  { value: "declined", label: "Declined" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-orange-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function StatusBadge({ r }: { r: ReviewRead }) {
  if (r.is_approved && !r.is_declined)
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
        Live
      </span>
    );
  if (r.is_declined)
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border bg-red-50 text-red-700 border-red-200">
        Declined
      </span>
    );
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
      Pending
    </span>
  );
}

function ReviewCard({
  r,
  tab,
  acting,
  onApprove,
  onDecline,
  onDelete,
}: {
  r: ReviewRead;
  tab: Tab;
  acting: Set<number>;
  onApprove?: () => void;
  onDecline?: () => void;
  onDelete?: () => void;
}) {
  const initials = r.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
      {/* Avatar + meta */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 text-sm leading-tight truncate">{r.name}</p>
            <StatusBadge r={r} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                r.role === "parent"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-orange-50 text-orange-600"
              }`}
            >
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
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Review text */}
      <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-4">
        {r.review_text}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        {tab === "pending" && (
          <button
            disabled={acting.has(r.id)}
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700
                       text-xs font-semibold rounded-lg hover:bg-green-100 disabled:opacity-40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
        )}

        {(tab === "pending" || tab === "approved") && (
          <button
            disabled={acting.has(r.id)}
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700
                       text-xs font-semibold rounded-lg hover:bg-amber-100 disabled:opacity-40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline
          </button>
        )}

        <button
          disabled={acting.has(r.id)}
          onClick={onDelete}
          className={`${tab === "declined" ? "flex-1" : ""} flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-600
                     text-xs font-semibold rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
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
  );
}

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const { toasts, toast } = useToast();

  const [tab, setTab] = useState<Tab>("pending");
  const [allReviews, setAllReviews] = useState<ReviewRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [acting, setActing] = useState<Set<number>>(new Set());
  const [clearing, setClearing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setLoadError(false);
    getAllAdminReviews(token)
      .then(setAllReviews)
      .catch((err) => {
        toast("error", err instanceof ApiError ? err.message : "Failed to load reviews");
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [token, retryCount]);

  const pending = allReviews.filter((r) => !r.is_approved && !r.is_declined);
  const approved = allReviews.filter((r) => r.is_approved && !r.is_declined);
  const declined = allReviews.filter((r) => r.is_declined);

  const withAct = async (
    id: number,
    fn: () => Promise<unknown>,
    successMsg: string,
    update: (prev: ReviewRead[]) => ReviewRead[]
  ) => {
    setActing((p) => new Set(p).add(id));
    try {
      await fn();
      setAllReviews(update);
      toast("success", successMsg);
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActing((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    }
  };

  const handleApprove = (r: ReviewRead) =>
    withAct(
      r.id,
      () => approveReview(r.id, token!),
      `${r.name}'s review is now live`,
      (prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, is_approved: true, is_declined: false } : x
        )
    );

  const handleDecline = (r: ReviewRead) =>
    withAct(
      r.id,
      () => declineReview(r.id, token!),
      `${r.name}'s review declined`,
      (prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, is_declined: true, is_approved: false } : x
        )
    );

  const handleDelete = (r: ReviewRead) => {
    if (!window.confirm(`Permanently delete ${r.name}'s review? This cannot be undone.`)) return;
    withAct(
      r.id,
      () => deleteReview(r.id, token!),
      "Review deleted",
      (prev) => prev.filter((x) => x.id !== r.id)
    );
  };

  const handleClearDeclined = async () => {
    if (!token) return;
    if (!window.confirm("Permanently delete all declined reviews? This cannot be undone.")) return;
    setClearing(true);
    try {
      await clearDeclinedReviews(token);
      setAllReviews((prev) => prev.filter((r) => !r.is_declined));
      toast("success", "All declined reviews cleared");
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Failed to clear reviews");
    } finally {
      setClearing(false);
    }
  };

  const tabCounts: Record<Tab, number> = {
    pending: pending.length,
    approved: approved.length,
    declined: declined.length,
  };

  const reviews =
    tab === "pending" ? pending : tab === "approved" ? approved : declined;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Review Moderation</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pending.length > 0 ? (
              <span className="text-amber-600 font-medium">
                {pending.length} review{pending.length !== 1 ? "s" : ""} awaiting approval
              </span>
            ) : (
              "No pending reviews"
            )}
            {approved.length > 0 && (
              <span className="text-slate-400"> · {approved.length} live</span>
            )}
            {declined.length > 0 && (
              <span className="text-slate-400"> · {declined.length} declined</span>
            )}
          </p>
        </div>
        {tab === "declined" && declined.length > 0 && (
          <button
            disabled={clearing}
            onClick={handleClearDeclined}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200
                       text-sm font-semibold rounded-xl hover:bg-red-100 active:bg-red-200
                       disabled:opacity-50 transition-colors self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {clearing ? "Clearing…" : "Clear All Declined"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 mb-6">
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === value ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {label}
            {tabCounts[value] > 0 && (
              <span
                className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${value === "pending" ? "bg-amber-100 text-amber-700" : ""}
                  ${value === "approved" ? "bg-green-100 text-green-700" : ""}
                  ${value === "declined" ? "bg-slate-200 text-slate-600" : ""}`}
              >
                {tabCounts[value]}
              </span>
            )}
          </button>
        ))}
      </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <SkeletonGrid />
      ) : loadError ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-900 font-semibold mb-1">Could not load reviews</p>
          <p className="text-slate-400 text-sm mb-4">Check your connection or log in again.</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="text-xs text-blue-600 underline hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-900 font-semibold mb-1">
            {tab === "pending"
              ? "All caught up"
              : tab === "approved"
              ? "No live reviews yet"
              : "No declined reviews"}
          </p>
          <p className="text-slate-400 text-sm">
            {tab === "pending"
              ? "No reviews pending approval."
              : tab === "approved"
              ? "Approved reviews will appear here."
              : "Declined review history is empty."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              r={r}
              tab={tab}
              acting={acting}
              onApprove={() => handleApprove(r)}
              onDecline={() => handleDecline(r)}
              onDelete={() => handleDelete(r)}
            />
          ))}
        </div>
      )}

      <Toaster toasts={toasts} />
    </div>
  );
}
