import { UserModel } from '@/models/user.model';
import { Resend } from 'resend';
import crypto from "crypto";
import { env, isProduction } from '@/utils/env';

const VERIFY_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// lazy Resend client so importing the module doesn't require the env var at build
let _resendClient: Resend | null = null;
function getResendClient() {
  if (_resendClient) return _resendClient;
  _resendClient = new Resend(env.RESEND_API_KEY);
  return _resendClient;
}

export async function sendMail({ email, emailType, userId }: {
  email: string;
  emailType: "signup";
  userId: string;
}) {
  if (emailType !== "signup") {
    throw new Error(`Unsupported emailType: ${emailType}`);
  }

  try {
    const domain = env.DOMAIN;
    const mailFrom = env.MAIL_FROM || "onboarding@resend.dev";
    const resend = getResendClient();

    // Store only a SHA-256 hash of the token; the raw token goes in the email.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const verifyUrl = `${domain}/verify-email?token=${rawToken}`;
    const htmlBody = `
    <p>Click <a href="${verifyUrl}">here</a> to verify your email,
    or copy and paste the following link in your browser.</p>
    <p>${verifyUrl}</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        verifyEmailToken: hashedToken,
        verifyEmailTokenExpires: Date.now() + VERIFY_TOKEN_TTL_MS,
      },
    });

    const mailResponse = await resend.emails.send({
      from: mailFrom,
      to: email,
      subject: "Verify Your Email",
      html: htmlBody,
    });

    if (!isProduction) {
      console.info("Verification email dispatched");
    }

    return mailResponse;
  } catch (err: unknown) {
    // Log the error message for diagnostics (never the token or other secrets).
    console.error("Mailer error:", err instanceof Error ? err.message : err);
    throw new Error(err instanceof Error ? err.message : "Error sending email");
  }
}
