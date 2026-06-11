# Aspire Learning Hub

**Live site: [https://www.aspirelearninghub.com.pk](https://www.aspirelearninghub.com.pk/)**

A full-stack, AI-integrated educational platform that streamlines the day-to-day learning and administration workflows of an academy — from student admissions and content management to an interactive AI tutor that guides students rather than just handing them answers.

<p>
  <img alt="Python"     src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white">
  <img alt="FastAPI"    src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white">
  <img alt="Next.js"    src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white">
  <img alt="React"      src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white">
  <img alt="Llama 3"    src="https://img.shields.io/badge/Llama%203-AI%20Tutor-0866FF?logo=meta&logoColor=white">
  <img alt="Vercel"     src="https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=white">
  <img alt="Render"     src="https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=white">
</p>

---

## Core Features

### AI Tutor
- Built on **Llama 3** (`llama-3.3-70b-versatile`), orchestrated through LangChain and served over Groq inference.
- Acts as an academic mentor with a fixed teaching persona: it follows the **Socratic method**, guiding students toward the answer instead of giving it away outright.
- **Streaming responses** for a live, typed-out feel, plus a standard request/response endpoint.
- **Session memory** — each exchange is summarized and carried into the next session, so the tutor remembers what a student was working on.
- Markdown- and math-aware on the frontend (KaTeX), so formulas and structured explanations render cleanly.

### Student & Admissions Workflows
- Multi-step **admission application** flow with status tracking (pending, approved, declined, revoked).
- **Content library** for notes and study material, managed by admins and served to admitted students.
- **Reviews** that students submit and admins moderate (approve / decline) before they appear publicly.
- A **contact** channel that delivers messages to the academy inbox.

### Authentication & Accounts
- Email/password signup with **OTP email verification** and rate-limited login.
- **Password reset** via signed, time-limited email links.
- **Google OAuth 2.0** sign-in, fully domain-verified and routed through the academy's own branded domain (see *Architecture* below).
- **Role-based access control** (standard student vs. admin) with a JWT-secured API and a dedicated admin dashboard.

---

## Architecture & DevOps

The application is **decoupled** into two independently deployed services:

| Layer        | Stack                                   | Hosting |
| ------------ | --------------------------------------- | ------- |
| **Frontend** | Next.js (React 19, App Router), Tailwind | Vercel  |
| **Backend**  | FastAPI (Python), SQLAlchemy, Alembic   | Render  |
| **Database** | PostgreSQL                              | Managed |
| **AI**       | Llama 3 via Groq + LangChain            | Groq    |

### Branded Google OAuth Proxy Flow

A common pain point with a decoupled setup is that Google OAuth must redirect to a **domain-verified** URL — and verifying a Render backend domain (or standing up OAuth subdomains) is awkward. This project sidesteps that with a proxy handshake that keeps the entire flow on the academy's own domain:

1. Google redirects the user back to the **Vercel frontend** at `/api/auth/callback/google` — the domain-verified, brand-consistent URL the user always sees.
2. That Next.js route handler forwards the authorization `code` to the FastAPI backend's `/api/v1/auth/google/exchange` endpoint.
3. The **backend** exchanges the code with Google (using the client secret), fetches the user profile, creates or activates the account, and issues a signed **JWT**.
4. The token is handed back to the frontend, which completes the session.

```
Google ──redirect──▶ Vercel (/api/auth/callback/google)
                         │  forwards code
                         ▼
                     Render backend (/api/v1/auth/google/exchange)
                         │  exchanges code, issues JWT
                         ▼
                     Vercel (/auth/callback) ──▶ logged-in session
```

The result: brand consistency (`aspirelearninghub.com.pk` throughout the consent flow) without extra subdomain infrastructure, while the OAuth client secret stays server-side on the backend.

### Operational notes
- **Migrations** run automatically on backend startup (Alembic upgrade to head), with a retry loop that waits for the database to become available.
- An **admin account** is seeded on first boot and sent a password-reset link to claim it.
- **Rate limiting** (SlowAPI) guards auth, AI, and submission endpoints.
- **Security middleware** adds hardening headers and structured request logging.
- **CORS** is restricted to the known frontend origins.

---

## Local Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and npm
- A reachable **PostgreSQL** instance
- A **Groq API key** (for the AI tutor) and, optionally, Google OAuth credentials and a Resend API key for email

### 1. Clone the repository

```bash
git clone https://github.com/faizanfk01/Aspire-learning-hub.git
cd aspire_learning_hub
```

### 2. Backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env   # then fill in the values below

# Run the API (migrations apply automatically on startup)
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`, and the admin dashboard at `http://localhost:8000/admin`.

#### Backend environment variables (`backend/.env`)

| Variable                | Required | Description |
| ----------------------- | :------: | ----------- |
| `DATABASE_URL`          | ✅ | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/aspire` |
| `SECRET_KEY`            | ✅ | Secret used to sign JWTs |
| `ALGORITHM`             |   | JWT algorithm (default `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | | Access token lifetime (default `60`) |
| `GROQ_API_KEY`          | ✅ | API key for Llama 3 inference via Groq |
| `GROQ_MODEL`            |   | Model id (default `llama-3.3-70b-versatile`) |
| `RESEND_API_KEY`        |   | Resend key for transactional email (OTP, password reset) |
| `ADMIN_EMAIL`           |   | Email seeded as the initial admin account |
| `CONTACT_EMAIL`         |   | Destination for contact-form submissions |
| `FRONTEND_URL`          |   | Public frontend URL (used in email links) |
| `BACKEND_URL`           |   | Public backend URL |
| `CORS_ORIGINS`          |   | Comma-separated allowed origins |
| `GOOGLE_CLIENT_ID`      |   | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET`  |   | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI`   |   | OAuth callback, e.g. `http://localhost:3000/api/auth/callback/google` |
| `LOG_LEVEL`             |   | `INFO` in production, `DEBUG` for verbose request/SQL logs |

> **Note:** The Google redirect URI points at the **frontend** (`/api/auth/callback/google`), not the backend — that is the proxy flow described above. In production it is `https://www.aspirelearninghub.com.pk/api/auth/callback/google`.

### 3. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local   # then fill in the values below

# Start the dev server
npm run dev
```

The app is now at `http://localhost:3000`.

#### Frontend environment variables (`frontend/.env.local`)

| Variable                       | Required | Description |
| ------------------------------ | :------: | ----------- |
| `NEXT_PUBLIC_API_URL`          | ✅ | Backend base URL, e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_LOGO_URL`         |   | CDN URL for the logo (falls back to `/public/assets/`) |
| `NEXT_PUBLIC_FAVICON_URL`      |   | CDN URL for the favicon |
| `NEXT_PUBLIC_INSTRUCTOR_IMG_1` |   | CDN URL for instructor image |
| `NEXT_PUBLIC_INSTRUCTOR_IMG_2` |   | CDN URL for instructor image |

---

## Project Structure

```
Aspire-learning-hub/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/v1/          # Route handlers (auth, admissions, ai_tutor, content, reviews, admin, contact)
│   │   ├── core/            # Config, database, security, rate limiting, logging
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # AI tutor, email, OTP services
│   │   ├── middleware/      # Security headers, request logging
│   │   └── main.py          # App entrypoint, startup, migrations, seeding
│   ├── alembic/             # Database migrations
│   ├── tests/               # Pytest suite
│   └── requirements.txt
│
└── frontend/                # Next.js application
    ├── src/
    │   ├── app/             # App Router pages (incl. OAuth proxy route)
    │   ├── components/      # Shared UI
    │   ├── context/         # Auth & chat context
    │   └── lib/             # API client
    └── package.json
```

---

## Running Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

---

## License

This project is proprietary to Aspire Learning Hub. All rights reserved.
