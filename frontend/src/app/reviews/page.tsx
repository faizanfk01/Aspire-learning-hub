"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { submitReview, getReviews, ApiError, ReviewRead } from "@/lib/api";
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

// ── Constants ─────────────────────────────────────────────────────────────────
const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent Experience",
};

const CATEGORIES = [
  "Quality of teaching",
  "Concept clarity",
  "Personalized guidance",
  "Career counseling",
  "Learning environment",
  "Online sessions & academic support",
  "Student confidence and progress",
  "Communication with parents",
];

// ── Input class ───────────────────────────────────────────────────────────────
const inputBase =
  "w-full px-4 py-3 border rounded-xl text-sm text-slate-900 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white";
const inputNormal = `${inputBase} border-slate-200 focus:ring-blue-500`;
const inputError  = `${inputBase} border-red-300 focus:ring-red-400`;

// ── Star display (read-only) ──────────────────────────────────────────────────
function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${cls} ${s <= rating ? "text-orange-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Interactive star rating ───────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (n: number) => void;
  error?: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <svg
              className={`w-9 h-9 transition-colors ${
                active >= star ? "text-orange-400" : "text-slate-200"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-sm font-semibold text-orange-500">{RATING_LABELS[active]}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: ReviewRead }) {
  const initials = review.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const date = new Date(review.created_at).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
      {/* Avatar + meta */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center
                        justify-center font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-tight">{review.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              review.role === "parent"
                ? "bg-blue-50 text-blue-700"
                : "bg-orange-50 text-orange-600"
            }`}>
              {review.role === "parent" ? "Parent" : "Student"}
            </span>
            <span className="text-xs text-slate-400 truncate">{review.program}</span>
          </div>
        </div>
      </div>

      {/* Rating + date */}
      <div className="flex items-center justify-between">
        <StarDisplay rating={review.rating} />
        <span className="text-xs text-slate-400">{date}</span>
      </div>

      {/* Review text */}
      <p className="text-slate-600 text-sm leading-relaxed">{review.review_text}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { user } = useAuth();

  // Existing reviews
  const [reviews, setReviews] = useState<ReviewRead[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, []);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "parent">("student");
  const [program, setProgram] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // Logged-in user's email is used automatically; guests can enter one for confirmation.
  const reviewerEmail = user?.email ?? (email.trim() || undefined);

  const clearErr = (f: string) =>
    setFieldErrors((p) => ({ ...p, [f]: "" }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2)        e.name    = "Please enter your full name.";
    if (program.trim().length < 2)     e.program = "Please enter your class or program.";
    if (rating === 0)                  e.rating  = "Please select a rating.";
    if (reviewText.trim().length < 20) e.reviewText = "Review must be at least 20 characters.";
    if (!user && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Please enter a valid email address.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSubmitting(true);
    setApiError("");
    try {
      await submitReview({
        name: name.trim(),
        role,
        program: program.trim(),
        rating,
        review_text: reviewText.trim(),
        reviewer_email: reviewerEmail,
      });
      setSuccess(true);
    } catch (err) {
      setApiError(
        err instanceof ApiError
          ? "Failed to submit your review. Please try again."
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
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
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              Student &amp; Parent Reviews
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.06] mb-5">
              Share Your{" "}
              <span className="text-blue-900">Experience</span>
              <span className="text-orange-500">.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.14}>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mb-10">
              Your feedback matters. Every review from our students and parents helps
              us grow, improve, and continue delivering quality education built on
              trust, concept-based learning, and student success.
            </p>
          </FadeUp>

          {/* Review categories */}
          <FadeUp delay={0.2}>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                We value your voice on
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Existing reviews ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FadeUp className="mb-10">
            <span className="section-label">What They Say</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Voices from Our Community
            </h2>
          </FadeUp>

          {reviewsLoading ? (
            /* Loading skeleton */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-slate-200 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="h-2.5 bg-slate-100 rounded" />
                    <div className="h-2.5 bg-slate-100 rounded w-5/6" />
                    <div className="h-2.5 bg-slate-100 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            /* Empty state */
            <FadeIn>
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl
                                flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Be the first to review</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  No reviews yet. Share your experience and help other students and
                  parents make the right choice.
                </p>
              </div>
            </FadeIn>
          ) : (
            /* Review grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review, i) => (
                <FadeUp key={review.id} delay={i * 0.05}>
                  <ReviewCard review={review} />
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Submit form ───────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FadeUp className="mb-8">
            <span className="section-label">Leave Your Review</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Tell Us About Your Experience
            </h2>
            <p className="text-slate-500 mt-3 text-sm leading-relaxed">
              How has Aspire Learning Hub helped you or your child academically? Your
              honest words can help other parents and students make the right educational
              choice. All reviews are moderated before publication.
            </p>
          </FadeUp>

          {success ? (
            <FadeIn>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Thank You, {name}!
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                  Your review has been submitted and is pending approval. We truly
                  appreciate you taking the time to share your experience.
                </p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearErr("name"); }}
                    placeholder="Your full name"
                    className={fieldErrors.name ? inputError : inputNormal}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email for confirmation — shown only when not logged in */}
                {!user && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email Address{" "}
                      <span className="text-slate-400 text-xs font-normal">(optional — for confirmation)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
                      placeholder="your@email.com"
                      className={fieldErrors.email ? inputError : inputNormal}
                    />
                    {fieldErrors.email ? (
                      <p className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-slate-400">
                        We&apos;ll send a confirmation to this address once your review is received.
                      </p>
                    )}
                  </div>
                )}

                {/* Role toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    You are a <span className="text-red-400">*</span>
                  </label>
                  <div className="inline-flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                    {(["student", "parent"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                          role === r
                            ? "bg-blue-900 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {r === "student" ? "Student" : "Parent"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class / Program */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Class / Program <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => { setProgram(e.target.value); clearErr("program"); }}
                    placeholder="e.g. Matric, FSc Pre-Medical, Grade 5"
                    className={fieldErrors.program ? inputError : inputNormal}
                  />
                  {fieldErrors.program && (
                    <p className="mt-1.5 text-xs text-red-500">{fieldErrors.program}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Rating <span className="text-red-400">*</span>
                  </label>
                  <StarRating
                    value={rating}
                    onChange={(v) => { setRating(v); clearErr("rating"); }}
                    error={fieldErrors.rating}
                  />
                </div>

                {/* Review text */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your Review <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={reviewText}
                    onChange={(e) => { setReviewText(e.target.value); clearErr("reviewText"); }}
                    placeholder="Share your experience – what difference did you notice in concepts, confidence, grades, or guidance? Please also mention your school and class/grade."
                    className={`resize-none ${fieldErrors.reviewText ? inputError : inputNormal}`}
                  />
                  <div className="flex justify-between mt-1.5">
                    {fieldErrors.reviewText
                      ? <p className="text-xs text-red-500">{fieldErrors.reviewText}</p>
                      : <span />
                    }
                    <p className="text-xs text-slate-400 ml-auto">
                      {reviewText.length} / 1500
                    </p>
                  </div>
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
                  disabled={submitting}
                  className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl
                             hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20
                             disabled:opacity-50 disabled:cursor-not-allowed text-sm
                             flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                       rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Review
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  Reviews are moderated before appearing publicly. We read every submission.
                </p>
              </form>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── Promise quote ─────────────────────────────────────────────────── */}
      <section className="bg-blue-900 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-800/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <FadeUp>
            <svg className="w-10 h-10 text-orange-400/50 mx-auto mb-5" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="text-white text-xl sm:text-2xl font-semibold leading-relaxed mb-6 italic">
              Every review is read with gratitude and responsibility. Your trust inspires us
              to keep building better students, stronger concepts, and brighter futures.
            </p>
            <p className="text-blue-300 text-sm font-medium tracking-wide">
              Trusted by students. Appreciated by parents. Built for academic excellence.
            </p>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
