"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getContent,
  createContent,
  updateContent,
  deleteContent,
  ContentItem,
  ContentCreate,
  ApiError,
} from "@/lib/api";
import { useToast, Toaster } from "@/components/admin/Toast";

const GRADES = ["Matric", "FSc", "Grade 7 & Below", "All Grades"];
const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
];

const emptyForm: ContentCreate = {
  title: "",
  description: "",
  content_type: "pdf",
  file_source: "",
  target_grade: "Matric",
};

function TypeBadge({ type }: { type: string }) {
  const s: Record<string, string> = {
    pdf: "bg-red-50 text-red-700 border-red-200",
    video: "bg-blue-50 text-blue-700 border-blue-200",
    article: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border uppercase ${s[type] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {type}
    </span>
  );
}

export default function AdminContentPage() {
  const { token } = useAuth();
  const { toasts, toast } = useToast();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<ContentCreate>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!token) return;
    getContent(token)
      .then(setContent)
      .catch(() => toast("error", "Failed to load content"))
      .finally(() => setLoading(false));
  }, [token]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description ?? "",
      content_type: item.content_type,
      file_source: item.file_source,
      target_grade: item.target_grade,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!form.title.trim() || !form.file_source.trim()) {
      toast("error", "Title and source URL are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: ContentCreate = {
        ...form,
        description: form.description?.trim() || undefined,
      };
      if (editItem) {
        const updated = await updateContent(editItem.id, payload, token);
        setContent((p) => p.map((c) => (c.id === updated.id ? updated : c)));
        toast("success", "Content updated successfully");
      } else {
        const created = await createContent(payload, token);
        setContent((p) => [created, ...p]);
        toast("success", "Content added successfully");
      }
      setShowForm(false);
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ContentItem) => {
    if (!token) return;
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeleting((p) => new Set(p).add(item.id));
    try {
      await deleteContent(item.id, token);
      setContent((p) => p.filter((c) => c.id !== item.id));
      toast("success", "Content deleted");
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Failed to delete content");
    } finally {
      setDeleting((p) => { const n = new Set(p); n.delete(item.id); return n; });
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Content Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{content.length} items across all grades</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-semibold
                     rounded-xl hover:bg-blue-800 active:bg-blue-950 transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Content
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editItem ? "Edit Content" : "Add New Content"}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Chapter 3 — Organic Chemistry Notes"
                className={inputCls}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type</label>
              <select
                value={form.content_type}
                onChange={(e) => setForm((p) => ({ ...p, content_type: e.target.value }))}
                className={inputCls}
              >
                {TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target Grade</label>
              <select
                value={form.target_grade}
                onChange={(e) => setForm((p) => ({ ...p, target_grade: e.target.value }))}
                className={inputCls}
              >
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Source URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Source URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={form.file_source}
                onChange={(e) => setForm((p) => ({ ...p, file_source: e.target.value }))}
                placeholder="https://drive.google.com/… or YouTube link"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of this resource…"
                className={`resize-none ${inputCls}`}
              />
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : editItem ? "Update" : "Add Content"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((n) => (
              <div key={n} className="px-6 py-4 flex gap-4 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-48" />
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No content yet. Add your first resource above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Title", "Type", "Grade", "Description", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 max-w-[260px]">
                    <a
                      href={item.file_source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.title}
                    </a>
                  </td>
                  <td className="px-5 py-3.5"><TypeBadge type={item.content_type} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{item.target_grade}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 max-w-[280px] truncate">
                    {item.description ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(item)}
                        title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        disabled={deleting.has(item.id)}
                        onClick={() => handleDelete(item)}
                        title="Delete"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
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
