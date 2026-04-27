import asyncio

import resend

from app.core.config import settings

_SENDER = "onboarding@resend.dev"
INSTRUCTOR_EMAIL = "muhammadfaizanb2b4@gmail.com"


def _send_sync(to: str, subject: str, html: str) -> None:
    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from": _SENDER,
        "to": [to],
        "subject": subject,
        "html": html,
    })


async def _send(to: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        print(f"[email] RESEND_API_KEY not set — skipping: {subject!r} → {to}")
        return
    try:
        await asyncio.to_thread(_send_sync, to, subject, html)
        print(f"[email] Sent via Resend: {subject!r} → {to}")
    except Exception as exc:
        print(f"[email] Resend error for {to}: {exc}")


async def send_otp_email(to_email: str, full_name: str, code: str) -> None:
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1d4ed8;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">Aspire Learning Hub</h1>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;
                  border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#374151;margin-top:0;">Hi <strong>{full_name}</strong>,</p>
        <p style="color:#374151;">
          Use the code below to verify your email address and activate your account.
          This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#eff6ff;border:2px solid #1d4ed8;border-radius:12px;
                    text-align:center;padding:28px;margin:28px 0;">
          <span style="font-size:44px;font-weight:bold;letter-spacing:12px;
                       color:#1d4ed8;font-family:monospace;">
            {code}
          </span>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          Do not share this code with anyone. If you did not create an account at
          Aspire Learning Hub, please ignore this email.
        </p>
      </div>
    </div>
    """
    await _send(to_email, "Your Aspire Learning Hub verification code", html)


async def send_admission_notification(
    student_name: str,
    father_name: str,
    grade: str,
    contact_number: str,
    address: str,
) -> None:
    rows = [
        ("Student Name",    student_name),
        ("Father's Name",   father_name),
        ("Grade",           grade),
        ("Contact Number",  contact_number),
        ("Address",         address),
    ]
    table_rows = "".join(
        f"""<tr style="background:{'#eff6ff' if i % 2 == 0 else '#ffffff'};">
              <td style="padding:12px 16px;border:1px solid #e5e7eb;
                         font-weight:bold;color:#1d4ed8;width:40%;">{label}</td>
              <td style="padding:12px 16px;border:1px solid #e5e7eb;color:#374151;">{value}</td>
            </tr>"""
        for i, (label, value) in enumerate(rows)
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1d4ed8;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">Aspire Learning Hub</h1>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;
                  border-top:none;border-radius:0 0 12px 12px;">
        <h2 style="color:#111827;margin-top:0;">New Admission Application</h2>
        <p style="color:#374151;">
          A new admission application has been submitted. Details below:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          {table_rows}
        </table>
        <p style="margin-top:28px;color:#6b7280;font-size:13px;">
          Please log in to the admin panel to review and process this application.
        </p>
      </div>
    </div>
    """
    await _send(
        INSTRUCTOR_EMAIL,
        f"New Admission: {student_name} — Grade {grade}",
        html,
    )
