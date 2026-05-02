"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { submitAdmission, AdmissionPayload } from "@/lib/api";

const GRADES = [
  "Play Group", "1", "2", "3", "4", "5", "6",
  "7", "8", "9", "10", "11", "12",
];

const TUITION_TYPES = [
  { value: "", label: "Select tuition type" },
  { value: "full", label: "Full Tuition" },
  { value: "specific_subjects", label: "Specific Subjects" },
];

const GENDERS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

type FormState = Required<Omit<AdmissionPayload, "address">>;

const EMPTY: FormState = {
  student_name: "",
  father_name: "",
  guardian_cnic: "",
  contact_number: "",
  grade: "",
  school_name: "",
  age: "",
  gender: "",
  tuition_type: "",
  specific_subjects: "",
  struggling_with: "",
};

export default function AdmissionsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=/admissions");
    }
  }, [isLoading, isAuthenticated, router]);

  // Pre-fill name from account holder (parent can overwrite freely).
  useEffect(() => {
    if (user?.full_name && !form.student_name) {
      setForm((p) => ({ ...p, student_name: user.full_name }));
    }
  }, [user?.full_name]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload: AdmissionPayload = { ...form };
      await submitAdmission(payload, token!);
      setSuccess(true);
      setForm({ ...EMPTY, student_name: user?.full_name ?? "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-900 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-2">
            Enrol Today
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admission Application</h1>
          <p className="text-blue-100 max-w-xl">
            Fill in the form below and our team will review your application and
            contact you within 1–2 working days.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-slate-50 min-h-[calc(100vh-64px-88px)]">
        <div className="max-w-2xl mx-auto space-y-6">

          {success && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                              justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Your admission application is <strong>pending review</strong>. Our team has
                been notified and will contact you on your provided number shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-lg
                             hover:bg-blue-800 transition-colors"
                >
                  Submit Another Application
                </button>
                <a
                  href="https://wa.me/923410784554"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-green-500 text-white font-semibold rounded-lg
                             hover:bg-green-600 transition-colors flex items-center
                             justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <SectionHeader icon="" title="Student Information" />
                <div className="space-y-5 mt-5">

                  <Field label="Student Name *">
                    <input
                      name="student_name" type="text" value={form.student_name}
                      onChange={handleChange} required
                      placeholder="Enter the student's full name"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Grade / Class *">
                      <select
                        name="grade" value={form.grade}
                        onChange={handleChange} required className={inputCls}
                      >
                        <option value="">Select a grade</option>
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g === "Play Group" ? "Play Group" : `Grade ${g}`}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Age *">
                      <input
                        name="age" type="number" min={3} max={25}
                        value={form.age} onChange={handleChange} required
                        placeholder="e.g. 12"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Gender *">
                      <select
                        name="gender" value={form.gender}
                        onChange={handleChange} required className={inputCls}
                      >
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="School Name">
                      <input
                        name="school_name" type="text" value={form.school_name}
                        onChange={handleChange}
                        placeholder="Current school (optional)"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <SectionHeader icon="" title="Parent / Guardian Information" />
                <div className="space-y-5 mt-5">

                  <Field label="Parent / Guardian Name *">
                    <input
                      name="father_name" type="text" value={form.father_name}
                      onChange={handleChange} required
                      placeholder="Full name of parent or guardian"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Parent / Guardian CNIC *">
                      <input
                        name="guardian_cnic" type="text" value={form.guardian_cnic}
                        onChange={handleChange} required
                        placeholder="e.g. 16101-1234567-1"
                        pattern="\d{5}-\d{7}-\d"
                        title="Format: XXXXX-XXXXXXX-X"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Contact Number *">
                      <input
                        name="contact_number" type="tel" value={form.contact_number}
                        onChange={handleChange} required
                        placeholder="e.g. 0300-1234567"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <SectionHeader icon="" title="Tuition Details" />
                <div className="space-y-5 mt-5">

                  <Field label="Tuition Type *">
                    <select
                      name="tuition_type" value={form.tuition_type}
                      onChange={handleChange} required className={inputCls}
                    >
                      {TUITION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Conditional: only shown when "Specific Subjects" is selected */}
                  {form.tuition_type === "specific_subjects" && (
                    <Field label="Please list the specific subjects you need help with *">
                      <textarea
                        name="specific_subjects"
                        value={form.specific_subjects}
                        onChange={handleChange}
                        required={form.tuition_type === "specific_subjects"}
                        rows={3}
                        placeholder="e.g. Mathematics (Algebra), Physics, English Grammar"
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                  )}

                  <Field label="What subjects are you currently struggling with and what specific problems are you facing? *">
                    <textarea
                      name="struggling_with"
                      value={form.struggling_with}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="e.g. I find calculus difficult, especially integration. I also struggle with essay writing in English..."
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3
                                rounded-xl text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor"
                    viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-blue-700 text-white font-bold rounded-xl
                           border-2 border-transparent hover:border-orange-400 hover:bg-blue-800
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm
                           shadow-md shadow-blue-700/20"
              >
                {submitting ? "Submitting & notifying our team…" : "Submit Application →"}
              </button>
            </form>
          )}

          {/* ── WhatsApp footer ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6
                          flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-gray-900 mb-0.5">Facing any problems?</p>
              <p className="text-gray-500 text-sm">
                You can also contact us directly on WhatsApp — we&apos;re happy to help
                with your admission query.
              </p>
            </div>
            <a
              href="https://wa.me/923410784554"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 bg-green-500
                         text-white font-bold rounded-xl hover:bg-green-600 transition-colors
                         shadow-md shadow-green-500/25 text-sm"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

        </div>
      </section>
    </>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
      <span className="text-xl">{icon}</span>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
  "focus:border-transparent transition-shadow bg-white";
