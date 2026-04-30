"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminStudents,
  cancelStudentAdmission,
  deleteStudent,
  AdminStudent,
  ApiError,
} from "@/lib/api";
import { useToast, Toaster } from "@/components/admin/Toast";

function AdmissionBadge({ admitted }: { admitted: boolean }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border
        ${admitted
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-slate-50 text-slate-500 border-slate-200"
        }`}
    >
      {admitted ? "Admitted" : "Not Admitted"}
    </span>
  );
}

export default function AdminStudentsPage() {
  const { token } = useAuth();
  const { toasts, toast } = useToast();

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!token) return;
    getAdminStudents(token)
      .then(setStudents)
      .catch(() => toast("error", "Failed to load students"))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const admitted = students.filter((s) => s.is_admitted).length;
  const total = students.length;

  const withAct = async (
    id: number,
    fn: () => Promise<unknown>,
    successMsg: string,
    update: (prev: AdminStudent[]) => AdminStudent[]
  ) => {
    setActing((p) => new Set(p).add(id));
    try {
      await fn();
      setStudents(update);
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

  const handleCancel = (s: AdminStudent) => {
    if (
      !window.confirm(
        `Cancel admission for ${s.full_name} (${s.email})?\n\nThis will set is_admitted to False and lock their Notes access. Their account and AI Tutor access remain active.`
      )
    )
      return;
    withAct(
      s.id,
      () => cancelStudentAdmission(s.id, token!),
      `Admission cancelled for ${s.full_name}`,
      (prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, is_admitted: false } : x))
    );
  };

  const handleDelete = (s: AdminStudent) => {
    if (
      !window.confirm(
        `Delete admission for ${s.full_name} (${s.email})?\n\nThis will clear all their admission records and set is_admitted to False. Their login account is preserved — they can re-apply at any time.`
      )
    )
      return;
    withAct(
      s.id,
      () => deleteStudent(s.id, token!),
      `${s.full_name} — admission cleared`,
      (prev) => prev.map((x) => (x.id === s.id ? { ...x, is_admitted: false } : x))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {admitted} admitted · {total} total registered
          </p>
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Total Registered", value: total, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Admitted (Active)", value: admitted, color: "text-green-700", bg: "bg-green-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-slate-200`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="px-6 py-4 flex gap-4 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-32" />
                <div className="h-3 bg-slate-100 rounded w-48" />
                <div className="h-3 bg-slate-100 rounded w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">
              {search ? "No students match your search." : "No students registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["#", "Full Name", "Email", "Account Status", "Admission", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap
                        ${h === "Actions" ? "w-24 text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">
                      {s.full_name}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {s.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border
                          ${s.is_active
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <AdmissionBadge admitted={s.is_admitted} />
                    </td>
                    <td className="px-5 py-3 w-24">
                      <div className="flex items-center gap-1 justify-end">
                        {s.is_admitted && (
                          <button
                            type="button"
                            title="Cancel Admission"
                            disabled={acting.has(s.id)}
                            onClick={() => handleCancel(s)}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg
                                       bg-orange-50 text-orange-700 border border-orange-200
                                       hover:bg-orange-100 disabled:opacity-40 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          title="Delete admission record"
                          disabled={acting.has(s.id)}
                          onClick={() => handleDelete(s)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg
                                     bg-red-50 text-red-600 border border-red-200
                                     hover:bg-red-100 disabled:opacity-40 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
