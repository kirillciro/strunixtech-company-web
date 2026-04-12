import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const SITE_NAME = "Company Platform";

// ── Shared layout helpers ──────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <!-- Logo header -->
        <tr><td align="center" style="padding-bottom:28px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:linear-gradient(135deg,#22d3ee,#3b82f6);border-radius:12px;padding:10px 14px;vertical-align:middle;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">CP</span>
              </td>
              <td style="padding-left:12px;vertical-align:middle;">
                <span style="font-size:18px;font-weight:700;color:#e2e8f0;letter-spacing:-0.3px;">${SITE_NAME}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#1e293b;border-radius:16px;border:1px solid #334155;padding:40px 40px 36px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
            © ${new Date().getFullYear()} ${SITE_NAME} · You're receiving this because you signed up at our platform.<br/>
            If you didn't, safely ignore this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email: Verify ──────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
): Promise<void> {
  const content = `
    <!-- Icon -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:rgba(34,211,238,0.12);border-radius:50%;width:52px;height:52px;text-align:center;vertical-align:middle;">
          <span style="font-size:24px;line-height:52px;">✉️</span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f1f5f9;line-height:1.3;">
      Verify your email address
    </h1>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#94a3b8;">
      Welcome to <strong style="color:#e2e8f0;">${SITE_NAME}</strong>! One quick step — click the button below to confirm your email address and activate your account.
      <br/><br/>
      This link is valid for <strong style="color:#22d3ee;">24 hours</strong>.
    </p>

    <!-- CTA button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#06b6d4,#3b82f6);">
          <a href="${verifyUrl}"
             style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.2px;border-radius:10px;">
            Verify Email Address →
          </a>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0 0 8px;font-size:12px;color:#64748b;">Or copy this link into your browser:</p>
    <p style="margin:0;font-size:11px;color:#475569;word-break:break-all;">${verifyUrl}</p>

    <hr style="border:none;border-top:1px solid #334155;margin:28px 0 0;" />
    <p style="margin:16px 0 0;font-size:12px;color:#475569;">
      Didn't create an account? You can safely ignore this email — no account will be created.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Verify your email – ${SITE_NAME}`,
    html: emailWrapper(content),
  });
}

// ── Email: Password Reset ──────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const content = `
    <!-- Icon -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:rgba(239,68,68,0.12);border-radius:50%;width:52px;height:52px;text-align:center;vertical-align:middle;">
          <span style="font-size:24px;line-height:52px;">🔐</span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f1f5f9;line-height:1.3;">
      Reset your password
    </h1>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#94a3b8;">
      We received a request to reset the password for your <strong style="color:#e2e8f0;">${SITE_NAME}</strong> account.
      Click the button below to set a new password.
      <br/><br/>
      This link expires in <strong style="color:#f87171;">15 minutes</strong>.
    </p>

    <!-- CTA button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="border-radius:10px;background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid #475569;">
          <a href="${resetUrl}"
             style="display:inline-block;padding:14px 36px;color:#f1f5f9;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.2px;border-radius:10px;">
            Reset Password →
          </a>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0 0 8px;font-size:12px;color:#64748b;">Or copy this link into your browser:</p>
    <p style="margin:0;font-size:11px;color:#475569;word-break:break-all;">${resetUrl}</p>

    <hr style="border:none;border-top:1px solid #334155;margin:28px 0 0;" />
    <p style="margin:16px 0 0;font-size:12px;color:#475569;">
      If you didn't request a password reset, your account is safe — just ignore this email.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Reset your password – ${SITE_NAME}`,
    html: emailWrapper(content),
  });
}
