"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminAdmissions,
  approveAdmission,
  declineAdmission,
  cancelAdmission,
  deleteAdmission,
  clearDeclinedAdmissions,
  AdminAdmission,
  ApiError,
} from "@/lib/api";
import { useToast, Toaster } from "@/components/admin/Toast";

type Filter = "all" | "pending" | "approved" | "rejected";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Declined" },
];

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${s[status] ?? s.pending}`}>
      {status === "rejected" ? "Declined" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminAdmissionsPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const { toasts, toast } = useToast();

  const [filter, setFilter] = useState<Filter>(
    (searchParams.get("status") as Filter) ?? "all"
  );
  const [admissions, setAdmissions] = useState<AdminAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [acting, setActing] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(
    (f: Filter) => {
      if (!token) return;
      setLoading(true);
      setLoadError(false);
      getAdminAdmissions(token, f === "all" ? undefined : f)
        .then(setAdmissions)
        .catch((err) => {
          toast("error", err instanceof ApiError ? err.message : "Failed to load admissions");
          setLoadError(true);
        })
        .finally(() => setLoading(false));
    },
    [token]
  );

  useEffect(() => { load(filter); }, [filter, load]);

  const withAct = async (
    id: number,
    fn: () => Promise<unknown>,
    successMsg: string,
    removeOnSuccess = false
  ) => {
    setActing((p) => new Set(p).add(id));
    try {
      await fn();
      if (removeOnSuccess) {
        setAdmissions((p) => p.filter((a) => a.id !== id));
      } else {
        load(filter);
      }
      toast("success", successMsg);
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActing((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleClearDeclined = async () => {
    if (!token) return;
    if (!window.confirm("Permanently delete all declined admission records? This cannot be undone.")) return;
    setClearing(true);
    try {
      await clearDeclinedAdmissions(token);
      setAdmissions([]);
      toast("success", "All declined admissions cleared");
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Failed to clear admissions");
    } finally {
      setClearing(false);
    }
  };

  const pending = admissions.filter((a) => a.status === "pending").length;
  const showClearDeclined = filter === "rejected" && admissions.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admission Queue</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pending > 0 ? (
              <span className="text-amber-600 font-medium">{pending} pending</span>
            ) : (
              "All admissions up to date"
            )}
            {" · "}{admissions.length} total shown
          </p>
        </div>
        {showClearDeclined && (
          <button
            disabled={clearing}
            onClick={handleClearDeclined}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200
                       text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {clearing ? "Clearing…" : "Clear All Declined"}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${filter === value
                ? "bg-white text-blue-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="px-6 py-4 flex gap-4 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-28" />
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-32 ml-auto" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="py-16 text-center">
            <p className="text-red-400 text-sm font-medium mb-3">
              Failed to load admissions. Check your connection or log in again.
            </p>
            <button
              onClick={() => load(filter)}
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : admissions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400">No admissions found for this filter.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Student", "Parent / Guardian", "Grade", "Contact", "Account Email", "Applied", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.map((a) => (
                <>
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-900 whitespace-nowrap">
                      {a.student_name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{a.father_name}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{a.grade}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">{a.contact_number}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                      {a.user_email ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {a.status === "pending" && (
                          <>
                            <button
                              disabled={acting.has(a.id)}
                              onClick={() => withAct(a.id, () => approveAdmission(a.id, token!), `${a.student_name} approved`)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                         bg-green-50 text-green-700 border border-green-200
                                         hover:bg-green-100 disabled:opacity-40 transition-colors whitespace-nowrap"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              disabled={acting.has(a.id)}
                              onClick={() => withAct(a.id, () => declineAdmission(a.id, token!), `${a.student_name} declined`)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                         bg-amber-50 text-amber-700 border border-amber-200
                                         hover:bg-amber-100 disabled:opacity-40 transition-colors whitespace-nowrap"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline
                            </button>
                          </>
                        )}
                        {a.status === "approved" && (
                          <button
                            disabled={acting.has(a.id)}
                            onClick={() => {
                              if (!window.confirm(`Cancel ${a.student_name}'s admission (${a.user_email ?? "no email"})?\n\nThis will set is_admitted to False and lock their Notes access. Their account remains active.`)) return;
                              withAct(a.id, () => cancelAdmission(a.id, token!), `${a.student_name}'s admission cancelled`);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                       bg-orange-50 text-orange-700 border border-orange-200
                                       hover:bg-orange-100 disabled:opacity-40 transition-colors whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Cancel Admission
                          </button>
                        )}
                        <button
                          disabled={acting.has(a.id)}
                          onClick={() => {
                            if (!window.confirm(`Delete ${a.student_name}'s admission record (${a.user_email ?? "no email"})?\n\nThis removes the admission record and sets their status to inactive. Their login account is preserved — they can re-apply at any time.`)) return;
                            withAct(a.id, () => deleteAdmission(a.id, token!), `${a.student_name} — admission deleted`, true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                     bg-red-50 text-red-600 border border-red-200
                                     hover:bg-red-100 disabled:opacity-40 transition-colors whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === a.id && (
                    <tr key={`${a.id}-detail`} className="bg-blue-50/40">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          {[
                            ["Age", a.age],
                            ["Gender", a.gender],
                            ["School", a.school_name],
                            ["Guardian CNIC", a.guardian_cnic],
                            ["Tuition Type", a.tuition_type],
                            ["Subjects", a.specific_subjects],
                          ].map(([label, val]) =>
                            val ? (
                              <div key={String(label)}>
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
                                <p className="text-slate-700">{val}</p>
                              </div>
                            ) : null
                          )}
                          {a.struggling_with && (
                            <div className="sm:col-span-3">
                              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Challenges / Notes</p>
                              <p className="text-slate-700 leading-relaxed">{a.struggling_with}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Toaster toasts={toasts} />
    </div>
  );
}
