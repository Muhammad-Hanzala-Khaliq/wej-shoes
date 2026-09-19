import { NextResponse } from "next/server";
import { registerSchema } from "@/validators/auth.validators";
import { createUser } from "@/features/users/user.service";
import { logError } from "@/lib/logger";

/**
 * POST handler for user registration
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password } = parsed.data;
    const result = await createUser({ firstName, lastName, email, phone, password });

    return NextResponse.json(
      { message: "Account created successfully", userId: result.id },
      { status: 201 }
    );
  } catch (error) {
    logError("/api/auth/signup", error);

    if (error.message === "Email already registered") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
