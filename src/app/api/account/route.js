import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAccountData } from "@/features/users/user.service";
import { logError } from "@/lib/logger";

/**
 * GET handler - Get account data (authenticated)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const data = await getAccountData(session.user.id);
    return NextResponse.json(data);
  } catch (error) {
    logError("GET /api/account", error);

    if (error.message === "User not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
