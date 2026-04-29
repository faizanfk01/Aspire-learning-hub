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
  is_admitted: boolean;
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

export const forgotPassword = (email: string) =>
  request<{ message: string }>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token: string, new_password: string) =>
  request<{ message: string }>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });

// ── Admissions ────────────────────────────────────────────────────────────────

export interface AdmissionPayload {
  student_name: string;
  father_name: string;       // guardian / parent name
  grade: string;
  contact_number: string;
  address?: string;
  guardian_cnic?: string;
  school_name?: string;
  age?: string;
  gender?: string;
  tuition_type?: string;
  specific_subjects?: string;
  struggling_with?: string;
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

// ── Contact ───────────────────────────────────────────────────────────────────

export interface ContactPayload {
  name: string;
  email_or_phone: string;
  subject: string;
  message: string;
  user_account_email?: string;
}

export interface ContactRead {
  id: number;
  name: string;
  email_or_phone: string;
  subject: string;
  message: string;
}

export const submitContact = (data: ContactPayload) =>
  request<ContactRead>("/api/v1/contact/", { method: "POST", body: JSON.stringify(data) });

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ReviewPayload {
  name: string;
  role: "student" | "parent";
  program: string;
  rating: number;
  review_text: string;
  reviewer_email?: string;
}

export interface ReviewRead {
  id: number;
  name: string;
  role: string;
  program: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export const submitReview = (data: ReviewPayload) =>
  request<ReviewRead>("/api/v1/reviews/", { method: "POST", body: JSON.stringify(data) });

export const getReviews = () =>
  request<ReviewRead[]>("/api/v1/reviews/");

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_admissions: number;
  pending_admissions: number;
  active_students: number;
  total_content: number;
  pending_reviews: number;
}

export interface AdminAdmission {
  id: number;
  student_name: string;
  father_name: string;
  grade: string;
  contact_number: string;
  address: string | null;
  age: string | null;
  gender: string | null;
  guardian_cnic: string | null;
  school_name: string | null;
  tuition_type: string | null;
  specific_subjects: string | null;
  struggling_with: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
}

export interface AdminStudent {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_admitted: boolean;
}

export interface ContentCreate {
  title: string;
  description?: string;
  content_type: string;
  file_source: string;
  target_grade: string;
}

export const getAdminStats = (token: string) =>
  request<DashboardStats>("/api/v1/admin/stats", {}, token);

export const getAdminAdmissions = (token: string, status?: string) => {
  const qs = status ? `?status=${status}` : "";
  return request<AdminAdmission[]>(`/api/v1/admin/admissions${qs}`, {}, token);
};

export const approveAdmission = (id: number, token: string) =>
  request<{ message: string }>(
    `/api/v1/admin/admissions/${id}/approve`,
    { method: "PATCH" },
    token
  );

export const declineAdmission = (id: number, token: string) =>
  request<{ message: string }>(
    `/api/v1/admin/admissions/${id}/decline`,
    { method: "PATCH" },
    token
  );

export const deleteAdmission = (id: number, token: string) =>
  request<undefined>(`/api/v1/admin/admissions/${id}`, { method: "DELETE" }, token);

export const getAdminStudents = (token: string) =>
  request<AdminStudent[]>("/api/v1/admin/students", {}, token);

export const getPendingReviews = (token: string) =>
  request<ReviewRead[]>("/api/v1/admin/pending-reviews", {}, token);

export const approveReview = (id: number, token: string) =>
  request<ReviewRead>(`/api/v1/reviews/${id}/approve`, { method: "PATCH" }, token);

export const deleteReview = (id: number, token: string) =>
  request<undefined>(`/api/v1/reviews/${id}`, { method: "DELETE" }, token);

export const createContent = (data: ContentCreate, token: string) =>
  request<ContentItem>("/api/v1/content/", { method: "POST", body: JSON.stringify(data) }, token);

export const updateContent = (id: number, data: ContentCreate, token: string) =>
  request<ContentItem>(`/api/v1/content/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);

export const deleteContent = (id: number, token: string) =>
  request<undefined>(`/api/v1/content/${id}`, { method: "DELETE" }, token);
