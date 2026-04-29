import asyncio

import resend

from app.core.config import settings

ADMIN_EMAIL = "aspireslearninghub@gmail.com"

_NOREPLY   = "Aspire Learning Hub <noreply@aspirelearninghub.com.pk>"
_ADMISSIONS = "Aspire Admissions <admissions@aspirelearninghub.com.pk>"
_ADMIN_SENDER = "Aspire Admission Notifications <admin@aspirelearninghub.com.pk>"

_FOOTER = (
    "<p style='color:#9ca3af;font-size:12px;margin-top:32px;"
    "border-top:1px solid #e5e7eb;padding-top:16px;'>"
    "This is an automated message from Aspire Learning Hub. "
    "Please do not reply to this email."
    "</p>"
)


def _send_sync(
    from_addr: str,
    to: str,
    subject: str,
    html: str,
    reply_to: str | None = None,
) -> None:
    resend.api_key = settings.RESEND_API_KEY
    params: dict = {"from": from_addr, "to": [to], "subject": subject, "html": html}
    if reply_to:
        params["reply_to"] = reply_to
    resend.Emails.send(params)


async def _send(
    from_addr: str,
    to: str,
    subject: str,
    html: str,
    reply_to: str | None = None,
) -> None:
    if not settings.RESEND_API_KEY:
        print(f"[email] RESEND_API_KEY not set — skipping: {subject!r} → {to}")
        return
    try:
        await asyncio.to_thread(_send_sync, from_addr, to, subject, html, reply_to)
        print(f"[email] Sent: {subject!r} → {to}")
    except Exception as exc:
        print(f"[email] Resend error for {to}: {exc}")


def _card(body: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1e3a5f;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">Aspire Learning Hub</h1>
        <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Building Strong Concepts · Mardan, KPK</p>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;
                  border-top:none;border-radius:0 0 12px 12px;">
        {body}
        {_FOOTER}
      </div>
    </div>
    """


async def send_otp_email(to_email: str, full_name: str, code: str) -> None:
    body = f"""
        <p style="color:#374151;margin-top:0;">Hi <strong>{full_name}</strong>,</p>
        <p style="color:#374151;">
          Use the code below to verify your email address and activate your account.
          This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#eff6ff;border:2px solid #1e3a5f;border-radius:12px;
                    text-align:center;padding:28px;margin:28px 0;">
          <span style="font-size:44px;font-weight:bold;letter-spacing:12px;
                       color:#1e3a5f;font-family:monospace;">{code}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          Do not share this code with anyone. If you did not create an account at
          Aspire Learning Hub, please ignore this email.
        </p>
    """
    await _send(_NOREPLY, to_email, "Your Aspire Learning Hub verification code", _card(body))


async def send_student_admission_confirmation(
    to_email: str,
    student_name: str,
    grade: str,
) -> None:
    body = f"""
        <p style="color:#374151;margin-top:0;">Dear <strong>{student_name}</strong> and family,</p>
        <p style="color:#374151;">
          Thank you for applying to <strong>Aspire Learning Hub</strong>. We have successfully
          received your admission application for <strong>Grade {grade}</strong>.
        </p>
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;
                    padding:16px 20px;margin:24px 0;">
          <p style="color:#15803d;margin:0;font-weight:bold;">Application Received</p>
          <p style="color:#166534;margin:8px 0 0;font-size:14px;">
            Our admissions team will review your application and contact you shortly.
            You can expect a response within 1–2 working days.
          </p>
        </div>
        <p style="color:#374151;">
          If you have any questions, please contact us at
          <a href="mailto:aspireslearninghub@gmail.com" style="color:#1e3a5f;">
            aspireslearninghub@gmail.com
          </a>.
        </p>
        <p style="color:#374151;">We look forward to welcoming you to the Aspire family!</p>
    """
    await _send(
        _ADMISSIONS,
        to_email,
        f"Admission Application Received — {student_name}",
        _card(body),
        reply_to=ADMIN_EMAIL,
    )


async def send_admission_notification(
    student_name: str,
    father_name: str,
    grade: str,
    contact_number: str,
    address: str,
    guardian_cnic: str = "",
    school_name: str = "",
    age: str = "",
    gender: str = "",
    tuition_type: str = "",
    specific_subjects: str = "",
    struggling_with: str = "",
) -> None:
    def _section(title: str, rows: list[tuple[str, str]]) -> str:
        header = (
            f"<tr><th colspan='2' style='background:#1e3a5f;color:#ffffff;"
            f"padding:10px 16px;text-align:left;font-size:13px;'>{title}</th></tr>"
        )
        body_rows = "".join(
            f"<tr style='background:{'#f8fafc' if i % 2 == 0 else '#ffffff'};'>"
            f"<td style='padding:10px 16px;border:1px solid #e5e7eb;"
            f"font-weight:600;color:#374151;width:38%;font-size:13px;'>{label}</td>"
            f"<td style='padding:10px 16px;border:1px solid #e5e7eb;"
            f"color:#374151;font-size:13px;'>{value or '<em style=\"color:#9ca3af\">—</em>'}</td>"
            f"</tr>"
            for i, (label, value) in enumerate(rows)
        )
        return header + body_rows

    tuition_label = {"full": "Full Tuition", "specific_subjects": "Specific Subjects"}.get(
        tuition_type, tuition_type or "—"
    )
    gender_label = gender.capitalize() if gender else ""

    student_rows = _section("Student Information", [
        ("Student Name",  student_name),
        ("Age",           age),
        ("Gender",        gender_label),
        ("Grade / Class", f"Grade {grade}" if grade not in ("Play Group", "") else grade),
        ("School Name",   school_name),
    ])

    guardian_rows = _section("Parent / Guardian Information", [
        ("Guardian Name",    father_name),
        ("Guardian CNIC",    guardian_cnic),
        ("Contact Number",   contact_number),
    ])

    tuition_rows_data = [("Tuition Type", tuition_label)]
    if tuition_type == "specific_subjects" and specific_subjects:
        tuition_rows_data.append(("Subjects Requested", specific_subjects))
    tuition_rows = _section("Tuition Details", tuition_rows_data)

    challenges_block = ""
    if struggling_with:
        challenges_block = f"""
        <h3 style="color:#111827;font-size:14px;margin:24px 0 8px;">
          Student&apos;s Challenges / Problems
        </h3>
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;
                    padding:14px 18px;font-size:13px;color:#374151;line-height:1.6;">
          {struggling_with}
        </div>"""

    body = f"""
        <h2 style="color:#111827;margin-top:0;font-size:18px;">
          New Admission Application
        </h2>
        <p style="color:#6b7280;font-size:13px;margin-bottom:20px;">
          A new admission application has been submitted. Please review the details below.
        </p>
        <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;
                      border:1px solid #e5e7eb;">
          {student_rows}
          {guardian_rows}
          {tuition_rows}
        </table>
        {challenges_block}
        <div style="margin-top:28px;">
          <a href="{settings.FRONTEND_URL}/admin/admissions"
             style="display:inline-block;background:#1e3a5f;color:#ffffff;
                    padding:12px 24px;border-radius:8px;text-decoration:none;
                    font-weight:bold;font-size:14px;">
            Review in Admin Panel
          </a>
        </div>
    """
    await _send(
        _ADMIN_SENDER,
        ADMIN_EMAIL,
        f"New Admission: {student_name} — Grade {grade}",
        _card(body),
    )


async def send_password_reset_email(
    to_email: str,
    full_name: str,
    reset_link: str,
) -> None:
    body = f"""
        <p style="color:#374151;margin-top:0;">Hi <strong>{full_name}</strong>,</p>
        <p style="color:#374151;">
          We received a request to reset the password for your Aspire Learning Hub account.
          Click the button below to choose a new password. This link expires in
          <strong>30 minutes</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="{reset_link}"
             style="display:inline-block;background:#f97316;color:#ffffff;
                    padding:14px 32px;border-radius:10px;text-decoration:none;
                    font-weight:bold;font-size:15px;letter-spacing:0.3px;">
            Reset My Password
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;">
          If you did not request a password reset, you can safely ignore this email.
          Your password will not change.
        </p>
        <p style="color:#6b7280;font-size:12px;word-break:break-all;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <a href="{reset_link}" style="color:#1e3a5f;">{reset_link}</a>
        </p>
    """
    await _send(_NOREPLY, to_email, "Reset your Aspire Learning Hub password", _card(body))
