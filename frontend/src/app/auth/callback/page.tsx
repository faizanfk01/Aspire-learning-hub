"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { getMe, ApiError } from "@/lib/api";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { resetChat } = useChat();
  const [error, setError] = useState("");

  useEffect(() => {
    const token  = searchParams.get("token");
    const next   = searchParams.get("next") ?? "/";
    const errParam = searchParams.get("error");

    if (errParam === "google_denied") {
      router.replace("/login");
      return;
    }
    if (errParam || !token) {
      setError("Google sign-in failed. Please try again.");
      return;
    }

    getMe(token)
      .then((user) => {
        resetChat();
        login(token, user);
        // Replace so the token URL never sits in browser history.
        router.replace(next.startsWith("/") ? next : "/");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          setError("Session expired. Please try signing in again.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <a href="/login" className="text-blue-700 hover:text-orange-500 text-sm underline
                                      transition-colors">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-blue-900 border-t-orange-500
                        rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
