import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/validators/auth.validators";
import { resetPasswordWithToken } from "@/features/users/user.service";
import { logError } from "@/lib/logger";

export async function POST(request) {
  try {
    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error?.issues?.[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    logError("/api/auth/reset-password", error, { message: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
