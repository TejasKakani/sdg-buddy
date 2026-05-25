import { UserModel } from '@/models/user.model';
import bcrypt from "bcrypt";
import { Resend } from 'resend';



// lazy Resend client so importing the module doesn't require the env var at build
let _resendClient: Resend | null = null;
function getResendClient() {
  if (_resendClient) return _resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  _resendClient = new Resend(key);
  return _resendClient;
}

export async function sendMail({ email, emailType, userId }: {
  email: string;
  emailType: string;
  userId: string;
}) {

  try {
    const domain = process.env.DOMAIN;
    if (!domain) {
      throw new Error('DOMAIN environment variable is not set');
    }
    const mailFrom = process.env.MAIL_FROM || `onboarding@resend.dev`;
    const resend = getResendClient();
    const verifyEmailToken = await bcrypt.hash(userId, 10);

    const verifyEmailHtml = `
    <p>Click <a href="${domain}/verify-email?token=${verifyEmailToken}">here</a> to ${emailType === "signup" ? "verify your email" : "reset your password"}
    or copy and paste the following link in your browser.
    </p>
    ${domain}/verify-email?token=${verifyEmailToken}
    <p>If you didn't request this, please ignore this email.</p>
  `;

    const resetPasswordHtml = `
      <p>Click <a href="${domain}/reset-password?token=${verifyEmailToken}">here</a> to ${emailType === "signup" ? "verify your email" : "reset your password"}
      or copy and paste the following link in your browser.
      </p>
      ${domain}/reset-password?token=${verifyEmailToken}
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
            verifyEmailToken,
            verifyEmailTokenExpires: Date.now() + 3600000
          }
        });
        break;
      case "reset-password":
        subjectLine = "Reset Password Email"
        htmlBody = resetPasswordHtml;
        await UserModel.findByIdAndUpdate(userId, {
          $set: {
            resetPasswordToken: verifyEmailToken,
            resetPasswordTokenExpires: Date.now() + 3600000
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

    return mailResponse;

  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error sending email";
    throw new Error(message);

  }
}