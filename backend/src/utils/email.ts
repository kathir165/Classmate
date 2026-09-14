import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("[email] RESEND_API_KEY is not configured.");
}

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendPasswordResetEmail(
  email: string,
  code: string
) {
  if (!resend) {
    throw new Error("Email service is not configured.");
  }

  const { error } = await resend.emails.send({
    from: "ClassMate <onboarding@resend.dev>",
    to: [email],
    subject: "ClassMate password reset code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>ClassMate Password Reset</h2>

        <p>You requested to reset your ClassMate password.</p>

        <p>Your verification code is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 10px;
          text-align: center;
        ">
          ${code}
        </div>

        <p>This code will expire in <strong>15 minutes</strong>.</p>

        <p>If you didn't request a password reset, you can safely ignore this email.</p>

        <p>— ClassMate</p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    throw new Error("Failed to send password reset email.");
  }
}