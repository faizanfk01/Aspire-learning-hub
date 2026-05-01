"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signup as apiSignup, verifyOtp, getMe } from "@/lib/api";

const logoSrc = process.env.NEXT_PUBLIC_LOGO_URL ?? "/assets/logo.svg";

type Step = "form" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep]       = useState<Step>("form");
  const [form, setForm]       = useState({ full_name: "", email: "", password: "" });
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [notice, setNotice]   = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: collect details, POST /signup ────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiSignup({ ...form, role: "standard" });
      // Backend created inactive user and emailed the OTP — move to step 2
      setNotice(`Verification code sent to ${form.email}`);
      setStep("otp");
    } catch (err: unknown) {
      // Show the exact backend message so Resend errors are visible in the UI
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      setStep("form"); // stay on form so user can retry
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: enter OTP, POST /verify-otp ─────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tokenData = await verifyOtp(form.email, code);
      const user = await getMe(tokenData.access_token);
      login(tokenData.access_token, user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await apiSignup({ ...form, role: "standard" });
      setOtp(["", "", "", "", "", ""]);
      setNotice("A new verification code has been sent to your email.");
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    window.location.href = `${base}/api/v1/auth/google/login?next=${encodeURIComponent("/")}`;
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src={logoSrc}
                alt="Aspire Learning Hub"
                width={120}
                height={120}
                className="rounded-xl"
              />
            </div>
            {step === "form" ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
                <p className="text-gray-500 text-sm mt-1">Join Aspire Learning Hub today</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                <p className="text-gray-500 text-sm mt-2">
                  A 6-digit code was sent to<br />
                  <span className="font-semibold text-blue-700">{form.email}</span>
                </p>
              </>
            )}
          </div>

          {/* Notice */}
          {notice && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200
                            text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {notice}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200
                            text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* ── STEP 1: Signup form ── */}
          {step === "form" && (
            <>
              {/* Google auth */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-5
                           border border-gray-300 rounded-xl text-sm font-medium text-gray-700
                           hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <Divider label="or sign up with email" />

              <form onSubmit={handleSignup} className="space-y-5 mt-5">
                <Field label="Full Name">
                  <input
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    placeholder="Ali Khan"
                    className={inputCls}
                  />
                </Field>

                <Field label="Email Address">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>

                <Field label="Password">
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    className={inputCls}
                  />
                </Field>

                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? <Spinner label="Sending code…" /> : "Sign Up"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-700 font-semibold hover:text-orange-500 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP verification ── */}
          {step === "otp" && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter verification code
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-300
                                 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500
                                 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className={primaryBtn}
              >
                {loading ? <Spinner label="Verifying…" /> : "Verify & Activate Account"}
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setNotice(""); }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-700 font-semibold hover:text-orange-500
                             transition-colors disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg
        className="w-4 h-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      {label}
    </span>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-gray-400">{label}</span>
      </div>
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
  "focus:border-transparent transition-shadow";

const primaryBtn =
  "w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl " +
  "border-2 border-transparent hover:border-orange-400 hover:bg-blue-800 " +
  "transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm";
