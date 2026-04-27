const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let detail = "An error occurred";
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserRead {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "standard";
  is_active: boolean;
}

/**
 * POST /api/v1/auth/signup
 * Creates an inactive user, stores OTP in DB, sends it via Resend.
 * Returns {message: "OTP sent to your email."} — NOT a token.
 */
export const signup = (data: {
  full_name: string;
  email: string;
  password: string;
  role?: string;
}) =>
  request<{ message: string }>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * POST /api/v1/auth/verify-otp
 * Validates the 6-digit code, activates the user, returns a JWT.
 */
export const verifyOtp = (email: string, otp_code: string) =>
  request<TokenResponse>("/api/v1/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp_code }),
  });

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new ApiError(res.status, data.detail ?? "Login failed");
  }
  return res.json();
};

export const getMe = (token: string) =>
  request<UserRead>("/api/v1/auth/me", {}, token);

// ── Admissions ────────────────────────────────────────────────────────────────

export interface AdmissionPayload {
  father_name: string;
  grade: string;
  contact_number: string;
  address: string;
}

export const submitAdmission = (data: AdmissionPayload, token: string) =>
  request("/api/v1/admissions/", { method: "POST", body: JSON.stringify(data) }, token);

// ── Content ───────────────────────────────────────────────────────────────────

export interface ContentItem {
  id: number;
  title: string;
  description: string | null;
  content_type: string;
  file_source: string;
  target_grade: string;
}

export const getContent = (
  token: string,
  params?: { grade?: string; content_type?: string }
) => {
  const qs =
    params && Object.keys(params).length
      ? `?${new URLSearchParams(params as Record<string, string>)}`
      : "";
  return request<ContentItem[]>(`/api/v1/content/${qs}`, {}, token);
};

// ── AI Tutor ──────────────────────────────────────────────────────────────────

export interface ChatResponse {
  response: string;
  model: string;
}

export const sendChat = (message: string, subject: string | undefined, token: string) =>
  request<ChatResponse>(
    "/api/v1/chat",
    { method: "POST", body: JSON.stringify({ message, subject }) },
    token
  );
