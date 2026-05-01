"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { submitContact, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ── Animation helpers ─────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconMapPin() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

// ── Input class helpers ───────────────────────────────────────────────────────
const inputBase =
  "w-full px-4 py-3 border rounded-xl text-sm text-slate-900 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white";
const inputNormal = inputBase + " border-slate-200 focus:ring-blue-500";
const inputError  = inputBase + " border-red-300 focus:ring-red-400";

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    subject: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("aspireslearninghub@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2)    errs.name    = "Please enter your full name.";
    if (!form.contact.trim())            errs.contact = "Please enter your email or phone number.";
    if (!form.subject.trim())            errs.subject = "Please enter a subject.";
    if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      await submitContact({
        name: form.name.trim(),
        email_or_phone: form.contact.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError("Failed to send your message. Please try again.");
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-24 w-80 h-80 bg-blue-900/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                            text-orange-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              Mardan · Khyber Pakhtunkhwa, Pakistan
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.06] mb-5">
              Get in{" "}
              <span className="text-blue-900">Touch</span>
              <span className="text-orange-500">.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
              Have a question about our programs, fees, or enrollment? Reach out via
              WhatsApp, email, or send us a message directly — we respond promptly.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* ── Left: Contact info ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Location */}
              <FadeUp delay={0}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100
                                    flex items-center justify-center text-blue-700 flex-shrink-0">
                      <IconMapPin />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Our Location
                    </p>
                  </div>
                  <p className="text-slate-900 font-semibold text-sm leading-relaxed">
                    Mardan, Khyber Pakhtunkhwa
                  </p>
                  <p className="text-slate-500 text-sm">Pakistan</p>
                </div>
              </FadeUp>

              {/* Email */}
              <FadeUp delay={0.06}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100
                                    flex items-center justify-center text-orange-500 flex-shrink-0">
                      <IconEnvelope />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Official Email
                    </p>
                  </div>
                  <a
                    href="mailto:aspireslearninghub@gmail.com"
                    className="text-blue-900 font-semibold text-sm hover:text-orange-500
                               transition-colors break-all"
                  >
                    aspireslearninghub@gmail.com
                  </a>
                  <div className="mt-3">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 text-xs font-medium
                                 text-slate-500 hover:text-blue-900 transition-colors
                                 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-blue-200"
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <IconCopy />
                          Copy address
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </FadeUp>

              {/* WhatsApp */}
              <FadeUp delay={0.12}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100
                                    flex items-center justify-center text-green-600 flex-shrink-0">
                      <IconWhatsApp />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      WhatsApp
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                    The fastest way to reach us. Message us directly for enrollment
                    queries, fee structure, or any questions.
                  </p>
                  <a
                    href="https://wa.me/923410784554"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3 px-5
                               bg-green-500 hover:bg-green-600 text-white font-bold text-sm
                               rounded-xl transition-colors shadow-md shadow-green-500/20"
                  >
                    <IconWhatsApp />
                    Message on WhatsApp
                  </a>
                </div>
              </FadeUp>

              {/* Hours */}
              <FadeUp delay={0.18}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200
                                    flex items-center justify-center text-slate-500 flex-shrink-0">
                      <IconClock />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Availability
                      </p>
                      <p className="text-slate-700 font-semibold text-sm">Available 24 / 7</p>
                      <p className="text-slate-400 text-xs">WhatsApp · Email · Contact Form</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* ── Right: Contact form ────────────────────────────────────── */}
            <FadeIn className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                {success ? (
                  /* Success state */
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <IconCheck />
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-4 mb-2">
                      Message Sent
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                      Thank you, <span className="font-semibold text-blue-900">{form.name}</span>.
                      We have received your message and will get back to you shortly.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                      <Link href="/" className="btn-navy text-sm">
                        Back to Home
                      </Link>
                      <Link href="/admissions" className="btn-orange text-sm">
                        Apply for Admission
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-7">
                      <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                        Send a Message
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Fill out the form below and we will respond within 24 hours.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={set("name")}
                          placeholder="Your full name"
                          className={fieldErrors.name ? inputError : inputNormal}
                        />
                        {fieldErrors.name && (
                          <p className="mt-1.5 text-xs text-red-500">{fieldErrors.name}</p>
                        )}
                      </div>

                      {/* Email / Phone */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email or Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.contact}
                          onChange={set("contact")}
                          placeholder="email@example.com or 03XX-XXXXXXX"
                          className={fieldErrors.contact ? inputError : inputNormal}
                        />
                        {fieldErrors.contact && (
                          <p className="mt-1.5 text-xs text-red-500">{fieldErrors.contact}</p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Subject <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={set("subject")}
                          placeholder="e.g. Fee structure, Enrollment, AI Tutor"
                          className={fieldErrors.subject ? inputError : inputNormal}
                        />
                        {fieldErrors.subject && (
                          <p className="mt-1.5 text-xs text-red-500">{fieldErrors.subject}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          rows={5}
                          value={form.message}
                          onChange={set("message")}
                          placeholder="Write your message here..."
                          className={`resize-none ${fieldErrors.message ? inputError : inputNormal}`}
                        />
                        {fieldErrors.message && (
                          <p className="mt-1.5 text-xs text-red-500">{fieldErrors.message}</p>
                        )}
                      </div>

                      {/* API error */}
                      {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                                        px-4 py-3 rounded-xl flex items-start gap-2">
                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd" />
                          </svg>
                          {apiError}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl
                                   hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20
                                   disabled:opacity-50 disabled:cursor-not-allowed text-sm
                                   flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                             rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-blue-900 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-800/50 rounded-full blur-3xl pointer-events-none" />
        <FadeUp className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to Start Your Academic Journey?
          </h2>
          <p className="text-blue-200 mb-8 text-sm leading-relaxed">
            Apply for admission and take the first step toward academic excellence
            with Aspire Learning Hub.
          </p>
          <Link href="/admissions" className="btn-orange">
            Apply for Admission
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </FadeUp>
      </section>

    </div>
  );
}
