import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/validators/auth.validators";
import { generatePasswordResetToken } from "@/features/users/user.service";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/emails/templates";
import { logError } from "@/lib/logger";

export async function POST(request) {
  try {
    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error?.issues?.[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email } = parsed.data;
    const { token, email: userEmail } = await generatePasswordResetToken(email);

    if (token && userEmail) {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password/${token}`;

      await sendEmail({
        to: userEmail,
        subject: "Reset Your HADAIRE FOOTWEAR Password",
        html: passwordResetEmail(resetUrl),
      });
    }

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    logError("/api/auth/forgot-password", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
