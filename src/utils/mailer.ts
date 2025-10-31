import { UserModel } from '@/models/user.model';
import bcrypt from "bcrypt"
import nodemailer from 'nodemailer';

export async function sendMail({ email, emailType, userId }: {
  email: string;
  emailType: string;
  userId: string;
}) {

  try {

    const verifyEmailToken = await bcrypt.hash(userId, 10);

    const verifyEmailHtml = `
    <p>Click <a href="${process.env.DOMAIN}/verify-email?token=${verifyEmailToken}">here</a> to ${emailType === "signup" ? "verify your email" : "reset your password"}
    or copy and paste the following link in your browser.
    </p>
    ${process.env.DOMAIN}/verify-email?token=${verifyEmailToken},
    <p>If you didn't request this, please ignore this email.</p>
  `;

    const resetPasswordHtml = `
      <p>Click <a href="${process.env.DOMAIN}/reset-password?token=${verifyEmailToken}">here</a> to ${emailType === "signup" ? "verify your email" : "reset your password"}
      or copy and paste the following link in your browser.
      </p>
      ${process.env.DOMAIN}/reset-password?token=${verifyEmailToken},
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
    }

    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "f3caee00ef5161",
        pass: "f101d7b6bbda43"
      }
    });

    const options = {
      from: 'tejaskakani.official@gmail.com',
      to: email,
      subject: subjectLine,
      html: htmlBody
    }

    const mailResponse = await transport.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return mailResponse;

  }
  catch (err: any) {
    throw new Error(err.message);

  }
}