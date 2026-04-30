"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminStats,
  getAdminAdmissions,
  approveAdmission,
  declineAdmission,
  deleteAdmission,
  DashboardStats,
  AdminAdmission,
  ApiError,
} from "@/lib/api";
import { useToast, Toaster } from "@/components/admin/Toast";

// ── Shared icon-button primitive ─────────────────────────────────────────────
const iconBtn = "w-8 h-8 inline-flex items-center justify-center rounded-lg border transition-colors disabled:opacity-40 flex-shrink-0";
const btnColors: Record<string, string> = {
  green:  "bg-green-50  text-green-700  border-green-200  hover:bg-green-100",
  amber:  "bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-100",
  red:    "bg-red-50    text-red-600    border-red-200    hover:bg-red-100",
};

function IconBtn({
  color, title, disabled, onClick, children,
}: {
  color: keyof typeof btnColors;
  title: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${iconBtn} ${btnColors[color]}`}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  href,
  errored,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  accent: string;
  href?: string;
  errored: boolean;
}) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 mb-1">
        {value === null ? (
          errored
            ? <span className="text-slate-300">—</span>
            : <span className="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" />
        ) : (
          value
        )}
      </p>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] ?? styles.pending}`}>
      {status === "rejected" ? "Declined" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-700 text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                   bg-white border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retry
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { toasts, toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [acting, setActing] = useState<Set<number>>(new Set());
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setLoadError(false);
    Promise.all([
      getAdminStats(token),
      getAdminAdmissions(token, "pending"),
    ])
      .then(([s, a]) => {
        setStats(s);
        setRecent(a.slice(0, 5));
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Failed to load dashboard data";
        toast("error", msg);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load, retryCount]);

  const act = async (
    id: number,
    fn: (id: number, tok: string) => Promise<unknown>,
    successMsg: string
  ) => {
    if (!token) return;
    setActing((p) => new Set(p).add(id));
    try {
      await fn(id, token);
      setRecent((p) => p.filter((a) => a.id !== id));
      setStats((s) => s ? { ...s, pending_admissions: Math.max(0, s.pending_admissions - 1) } : s);
      toast("success", successMsg);
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActing((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm">
          {greeting}, <span className="font-semibold text-slate-700">{user?.full_name}</span>
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Dashboard</h1>
      </div>

      {/* Error banner */}
      {!loading && loadError && (
        <ErrorBanner
          message="Could not load dashboard data. Check your connection or log in again."
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Admissions"
          value={stats?.total_admissions ?? null}
          errored={loadError}
          accent="bg-blue-50"
          href="/admin/admissions"
          icon={<svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Pending Admissions"
          value={stats?.pending_admissions ?? null}
          errored={loadError}
          accent="bg-amber-50"
          href="/admin/admissions?status=pending"
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Active Students"
          value={stats?.active_students ?? null}
          errored={loadError}
          accent="bg-green-50"
          href="/admin/students"
          icon={<svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Content Items"
          value={stats?.total_content ?? null}
          errored={loadError}
          accent="bg-purple-50"
          href="/admin/content"
          icon={<svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatCard
          label="Pending Reviews"
          value={stats?.pending_reviews ?? null}
          errored={loadError}
          accent="bg-orange-50"
          href="/admin/reviews"
          icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
      </div>

      {/* Recent pending admissions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Pending Admissions</h2>
          <Link href="/admin/admissions" className="text-blue-700 text-sm font-medium hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((n) => (
              <div key={n} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-32" />
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="px-6 py-12 text-center">
            <p className="text-red-400 text-sm font-medium">Could not load pending admissions.</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="mt-3 text-xs text-blue-600 underline hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">No pending admissions. You are all caught up.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Student", "Parent / Guardian", "Grade", "Account Email", "Applied", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap
                        ${h === "Actions" ? "w-28 text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{a.student_name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{a.father_name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{a.grade}</td>
                    <td className="px-5 py-3 text-sm text-slate-500 whitespace-nowrap">{a.user_email ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3 w-28">
                      <div className="flex items-center gap-1 justify-end">
                        <IconBtn
                          color="green"
                          title="Approve"
                          disabled={acting.has(a.id)}
                          onClick={() => act(a.id, approveAdmission, `${a.student_name} approved`)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </IconBtn>
                        <IconBtn
                          color="amber"
                          title="Decline"
                          disabled={acting.has(a.id)}
                          onClick={() => act(a.id, declineAdmission, `${a.student_name} declined`)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </IconBtn>
                        <IconBtn
                          color="red"
                          title="Delete record"
                          disabled={acting.has(a.id)}
                          onClick={() => {
                            if (!window.confirm(`Delete ${a.student_name}'s admission (${a.user_email ?? "no email"})?\n\nThis removes the admission record and sets their status to inactive. Their account is preserved — they can re-apply.`)) return;
                            act(a.id, deleteAdmission, `${a.student_name} — admission deleted`);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toaster toasts={toasts} />
    </div>
  );
}
