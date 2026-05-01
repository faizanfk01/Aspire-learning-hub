import asyncio

import resend

from app.core.config import settings

_NOREPLY      = "Aspire Learning Hub <noreply@aspirelearninghub.com.pk>"
_ADMISSIONS   = "Aspire Admissions <admissions@aspirelearninghub.com.pk>"
_ADMIN_SENDER = "Aspire Admission Notifications <admin@aspirelearninghub.com.pk>"
_CONTACT      = "Aspire Learning Hub <contact@aspirelearninghub.com.pk>"

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
          <a href="mailto:{settings.ADMIN_EMAIL}" style="color:#1e3a5f;">
            {settings.ADMIN_EMAIL}
          </a>.
        </p>
        <p style="color:#374151;">We look forward to welcoming you to the Aspire family!</p>
    """
    await _send(
        _ADMISSIONS,
        to_email,
        f"Admission Application Received — {student_name}",
        _card(body),
        reply_to=settings.ADMIN_EMAIL,
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
            "<tr><th colspan='2' style='background:#1e3a5f;color:#ffffff;"
            "padding:10px 16px;text-align:left;font-size:13px;'>"
            + title
            + "</th></tr>"
        )
        parts = []
        for i, (label, value) in enumerate(rows):
            bg = "#f8fafc" if i % 2 == 0 else "#ffffff"
            cell = value if value else "<em style='color:#9ca3af'>&#8212;</em>"
            parts.append(
                f"<tr style='background:{bg};'>"
                f"<td style='padding:10px 16px;border:1px solid #e5e7eb;"
                f"font-weight:600;color:#374151;width:38%;font-size:13px;'>{label}</td>"
                f"<td style='padding:10px 16px;border:1px solid #e5e7eb;"
                f"color:#374151;font-size:13px;'>{cell}</td>"
                f"</tr>"
            )
        return header + "".join(parts)

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
        settings.ADMIN_EMAIL,
        f"New Admission: {student_name} — Grade {grade}",
        _card(body),
    )


def _esc(s: str) -> str:
    """Minimal HTML escaping so user input cannot break email templates."""
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


async def send_contact_notification(
    name: str,
    email_or_phone: str,
    subject: str,
    message: str,
) -> None:
    """Notify contact@aspirelearninghub.com.pk of a new general inquiry."""
    rows = [
        ("Name",           name),
        ("Email / Phone",  email_or_phone),
        ("Subject",        subject),
    ]
    rows_html = "".join(
        f"<tr style='background:{'#f8fafc' if i % 2 == 0 else '#ffffff'};'>"
        f"<td style='padding:10px 16px;border:1px solid #e5e7eb;font-weight:600;"
        f"color:#374151;width:35%;font-size:13px;'>{label}</td>"
        f"<td style='padding:10px 16px;border:1px solid #e5e7eb;color:#374151;"
        f"font-size:13px;'>{_esc(value)}</td></tr>"
        for i, (label, value) in enumerate(rows)
    )

    body = f"""
        <h2 style="color:#111827;margin-top:0;font-size:18px;">New General Inquiry</h2>
        <p style="color:#6b7280;font-size:13px;margin-bottom:20px;">
          A visitor submitted the contact form on Aspire Learning Hub.
        </p>
        <table style="width:100%;border-collapse:collapse;border-radius:8px;
                      overflow:hidden;border:1px solid #e5e7eb;">
          <tr><th colspan='2' style='background:#1e3a5f;color:#ffffff;padding:10px 16px;
                                     text-align:left;font-size:13px;'>Inquiry Details</th></tr>
          {rows_html}
        </table>
        <h3 style="color:#111827;font-size:14px;margin:24px 0 8px;">Message</h3>
        <div style="background:#f8fafc;border-left:4px solid #1e3a5f;
                    border-radius:0 8px 8px 0;padding:16px 20px;font-size:13px;
                    color:#374151;line-height:1.7;white-space:pre-wrap;
                    word-break:break-word;">{_esc(message)}</div>
    """

    reply_to = email_or_phone if "@" in email_or_phone else None
    print(f"[contact-email] Sending admin notification — from: {name!r} | subject: {subject!r}")
    await _send(
        _CONTACT,
        settings.ADMIN_EMAIL,
        "New General Inquiry - Aspire Learning Hub",
        _card(body),
        reply_to=reply_to,
    )


async def send_contact_auto_reply(name: str, to_email: str) -> None:
    """Send a 'Thank You' confirmation to the person who submitted the contact form."""
    body = f"""
        <p style="color:#374151;margin-top:0;">
          Dear <strong>{_esc(name)}</strong>,
        </p>
        <p style="color:#374151;line-height:1.7;">
          Thank you for reaching out to <strong>Aspire Learning Hub</strong>. We have
          successfully received your message and our team will get back to you shortly
          — typically within <strong>24 hours</strong>.
        </p>
        <div style="background:#eff6ff;border-left:4px solid #1e3a5f;
                    border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
          <p style="color:#1e3a5f;margin:0;font-weight:bold;font-size:14px;">
            Need a faster response?
          </p>
          <p style="color:#374151;margin:8px 0 12px;font-size:13px;">
            Message us directly on WhatsApp for immediate assistance.
          </p>
          <a href="https://wa.me/923410784554"
             style="display:inline-block;background:#25d366;color:#ffffff;
                    padding:10px 20px;border-radius:8px;text-decoration:none;
                    font-weight:bold;font-size:13px;">
            Message on WhatsApp
          </a>
        </div>
        <p style="color:#374151;line-height:1.7;">
          We appreciate you taking the time to contact us and look forward to
          speaking with you soon.
        </p>
        <p style="color:#374151;margin-bottom:0;">
          Warm regards,<br/>
          <strong>The Aspire Learning Hub Team</strong><br/>
          <span style="color:#6b7280;font-size:13px;">Mardan, Khyber Pakhtunkhwa, Pakistan</span>
        </p>
    """
    print(f"[contact-email] Sending auto-reply → {to_email}")
    await _send(
        _NOREPLY,
        to_email,
        "We've received your message - Aspire Learning Hub",
        _card(body),
        reply_to=settings.CONTACT_EMAIL,
    )


async def send_admission_approved_email(to_email: str, full_name: str) -> None:
    """Congratulations email sent when admin approves a student's admission."""
    body = f"""
        <p style="color:#374151;margin-top:0;">
          Dear <strong>{_esc(full_name)}</strong>,
        </p>
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;
                    border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
          <p style="color:#15803d;margin:0;font-weight:bold;font-size:16px;">
            Congratulations! Your Admission has been Approved.
          </p>
        </div>
        <p style="color:#374151;line-height:1.7;">
          We are thrilled to welcome you to <strong>Aspire Learning Hub</strong>!
          Your application has been reviewed and approved by our team.
        </p>
        <p style="color:#374151;line-height:1.7;">
          You now have <strong>full access</strong> to all learning resources:
        </p>
        <ul style="color:#374151;line-height:1.9;padding-left:20px;margin:0 0 24px;">
          <li><strong>Study Notes &amp; Lecture PDFs</strong> — Grade-wise curated materials</li>
          <li><strong>AI-Powered Tutor</strong> — Ask any academic question, available 24/7</li>
        </ul>
        <div style="margin-bottom:24px;">
          <a href="{settings.FRONTEND_URL}/notes"
             style="display:inline-block;background:#f97316;color:#ffffff;
                    padding:12px 24px;border-radius:8px;text-decoration:none;
                    font-weight:bold;font-size:14px;margin-right:12px;">
            Access Your Notes
          </a>
          <a href="{settings.FRONTEND_URL}/ai-tutor"
             style="display:inline-block;background:#1e3a5f;color:#ffffff;
                    padding:12px 24px;border-radius:8px;text-decoration:none;
                    font-weight:bold;font-size:14px;">
            Try AI Tutor
          </a>
        </div>
        <p style="color:#374151;line-height:1.7;">
          If you have any questions, reach us at
          <a href="mailto:{settings.ADMIN_EMAIL}" style="color:#1e3a5f;">
            {settings.ADMIN_EMAIL}
          </a>
          or on WhatsApp.
        </p>
        <p style="color:#374151;margin-bottom:0;">
          Warm regards,<br/>
          <strong>The Aspire Learning Hub Team</strong><br/>
          <span style="color:#6b7280;font-size:13px;">Mardan, Khyber Pakhtunkhwa, Pakistan</span>
        </p>
    """
    print(f"[admission-email] Sending approval congratulations → {to_email}")
    await _send(
        _ADMISSIONS,
        to_email,
        "Congratulations! Your Admission is Approved — Aspire Learning Hub",
        _card(body),
        reply_to=settings.ADMIN_EMAIL,
    )


async def send_review_notification(
    name: str,
    role: str,
    program: str,
    rating: int,
    review_text: str,
) -> None:
    """Notify the instructor that a new review is pending approval."""
    stars = "★" * rating + "☆" * (5 - rating)
    role_label = "Parent" if role == "parent" else "Student"

    rows = [
        ("Reviewer Name",   name),
        ("Role",            role_label),
        ("Class / Program", program),
        ("Rating",          f"{stars} ({rating}/5)"),
    ]
    rows_html = "".join(
        f"<tr style='background:{'#f8fafc' if i % 2 == 0 else '#ffffff'};'>"
        f"<td style='padding:10px 16px;border:1px solid #e5e7eb;font-weight:600;"
        f"color:#374151;width:35%;font-size:13px;'>{label}</td>"
        f"<td style='padding:10px 16px;border:1px solid #e5e7eb;color:#374151;"
        f"font-size:13px;'>{_esc(value)}</td></tr>"
        for i, (label, value) in enumerate(rows)
    )

    body = f"""
        <h2 style="color:#111827;margin-top:0;font-size:18px;">New Review Submitted</h2>
        <p style="color:#6b7280;font-size:13px;margin-bottom:20px;">
          A new review has been submitted and is <strong>pending your approval</strong>
          before it appears publicly on the website.
        </p>
        <table style="width:100%;border-collapse:collapse;border-radius:8px;
                      overflow:hidden;border:1px solid #e5e7eb;">
          <tr><th colspan='2' style='background:#1e3a5f;color:#ffffff;padding:10px 16px;
                                     text-align:left;font-size:13px;'>Review Details</th></tr>
          {rows_html}
        </table>
        <h3 style="color:#111827;font-size:14px;margin:24px 0 8px;">Review Text</h3>
        <div style="background:#f8fafc;border-left:4px solid #1e3a5f;
                    border-radius:0 8px 8px 0;padding:16px 20px;font-size:13px;
                    color:#374151;line-height:1.7;white-space:pre-wrap;
                    word-break:break-word;">{_esc(review_text)}</div>
        <div style="margin-top:24px;background:#fffbeb;border-left:4px solid #f59e0b;
                    border-radius:0 8px 8px 0;padding:14px 18px;">
          <p style="color:#92400e;margin:0;font-size:13px;">
            Log in to your admin panel to approve or remove this review before it
            appears publicly on the website.
          </p>
        </div>
    """
    print(f"[review-email] Sending instructor notification for review by {name!r}")
    await _send(
        _ADMIN_SENDER,
        settings.ADMIN_EMAIL,
        "New Review Submitted - Aspire Learning Hub",
        _card(body),
    )


async def send_review_confirmation(to_email: str, name: str) -> None:
    """Confirm to the reviewer that their submission has been received and is under moderation."""
    body = f"""
        <p style="color:#374151;margin-top:0;">Dear <strong>{_esc(name)}</strong>,</p>
        <p style="color:#374151;line-height:1.7;">
          Thank you for taking the time to share your experience with
          <strong>Aspire Learning Hub</strong>. We have successfully received your review.
        </p>
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;
                    border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
          <p style="color:#15803d;margin:0;font-weight:bold;font-size:14px;">
            Review Received
          </p>
          <p style="color:#166534;margin:8px 0 0;font-size:13px;line-height:1.6;">
            Your review is now under moderation. Once our team has reviewed it,
            it will appear publicly on the Aspire Learning Hub website.
          </p>
        </div>
        <p style="color:#374151;line-height:1.7;">
          We genuinely appreciate your feedback — it helps us improve our services
          and supports every student's learning journey.
        </p>
        <p style="color:#374151;margin-bottom:0;">
          Warm regards,<br/>
          <strong>The Aspire Learning Hub Team</strong><br/>
          <span style="color:#6b7280;font-size:13px;">Mardan, Khyber Pakhtunkhwa, Pakistan</span>
        </p>
    """
    print(f"[review-email] Sending confirmation → {to_email}")
    await _send(
        _NOREPLY,
        to_email,
        "Review Received — Aspire Learning Hub",
        _card(body),
        reply_to=settings.CONTACT_EMAIL,
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
