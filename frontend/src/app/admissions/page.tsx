"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { submitAdmission, AdmissionPayload } from "@/lib/api";

const GRADES = ["Play Group","1","2","3","4","5","6","7","8","9","10","11","12"];

export default function AdmissionsPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<AdmissionPayload>({
    father_name: "",
    grade: "",
    contact_number: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitAdmission(form, token!);
      setSuccess(true);
      setForm({ father_name: "", grade: "", contact_number: "", address: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admission Application</h1>
          <p className="text-blue-100">
            Fill in the form below and we will review your application shortly.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success card */}
          {success && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-10 text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-6">
                Your admission application is <strong>pending review</strong> and your
                instructor has been <strong>notified by email</strong>. We will contact
                you on the provided number once it&apos;s processed.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-lg
                           hover:bg-blue-800 transition-colors"
              >
                Submit Another Application
              </button>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Student Details</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Student name (from auth — read-only) */}
              <Field label="Student Name">
                <input
                  type="text"
                  value={user?.full_name ?? ""}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             text-gray-500 cursor-not-allowed text-sm"
                />
              </Field>

              <Field label="Father's Name *">
                <input
                  name="father_name"
                  type="text"
                  value={form.father_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter father's full name"
                  className={inputCls}
                />
              </Field>

              <Field label="Grade Applying For *">
                <select
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  required
                  className={inputCls}
                >
                  <option value="">Select a grade</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </Field>

              <Field label="Contact Number *">
                <input
                  name="contact_number"
                  type="tel"
                  value={form.contact_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 0300-1234567"
                  className={inputCls}
                />
              </Field>

              <Field label="Home Address *">
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Enter your full home address"
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl
                           border-2 border-transparent hover:border-orange-400 hover:bg-blue-800
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? "Submitting & notifying instructor…" : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
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
