import { UserModel } from '@/models/user.model';
import { Resend } from 'resend';
import crypto from "crypto";
import { env } from '@/utils/env';
import util from 'util';



// lazy Resend client so importing the module doesn't require the env var at build
let _resendClient: Resend | null = null;
function getResendClient() {
  if (_resendClient) return _resendClient;
  _resendClient = new Resend(env.RESEND_API_KEY);
  return _resendClient;
}

export async function sendMail({ email, emailType, userId }: {
  email: string;
  emailType: string;
  userId: string;
}) {

  try {
    const domain = env.DOMAIN;
    const mailFrom = env.MAIL_FROM || "onboarding@resend.dev";
    const resend = getResendClient();
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const verifyEmailHtml = `
    <p>Click <a href="${domain}/verify-email?token=${rawToken}">here</a> to ${emailType === "signup" ? "verify your email" : "reset your password"}
    or copy and paste the following link in your browser.
    </p>
    ${domain}/verify-email?token=${rawToken}
    <p>If you didn't request this, please ignore this email.</p>
  `;

    const resetPasswordHtml = `
      <p>Click <a href="${domain}/reset-password?token=${rawToken}">here</a> to ${emailType === "signup" ? "verify your email" : "reset your password"}
      or copy and paste the following link in your browser.
      </p>
      ${domain}/reset-password?token=${rawToken}
      <p>If you didn't request this, please ignore this email.</p>
    `;

    let subjectLine = "";
    let htmlBody = ``;

    switch (emailType) {
      case "signup":
        subjectLine = "Verify Your Email";
        htmlBody = verifyEmailHtml;
        await UserModel.findByIdAndUpdate(userId, {
          $set: {
            verifyEmailToken: hashedToken,
            verifyEmailTokenExpires: Date.now() + 3600000
          }
        });
        break;
      case "reset-password":
        subjectLine = "Reset Password Email"
        htmlBody = resetPasswordHtml;
        await UserModel.findByIdAndUpdate(userId, {
          $set: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: Date.now() + 3600000
          }
        });
        break;
      default:
        throw new Error(`Unknown emailType: ${emailType}`);
    }

    const options = {
      from: mailFrom,
      to: email,
      subject: subjectLine,
      html: htmlBody,
    };

    const mailResponse = await resend.emails.send(options);
    try {
      // Log a detailed inspected representation of the response (truncated)
      const inspected = util.inspect(mailResponse, { depth: 5, colors: false });
      console.info("Resend send response (inspected):", inspected.slice(0, 2000));
    } catch (e) {
      // ignore logging errors
    }

    return mailResponse;

  }
  catch (err: unknown) {
    // Log full error for diagnostics (do not print secrets)
    console.error("Mailer error:", err instanceof Error ? err.message : err);
    const message = err instanceof Error ? err.message : "Error sending email";
    throw new Error(message);

  }
}