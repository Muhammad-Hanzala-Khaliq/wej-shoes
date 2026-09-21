import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import { logError } from "@/lib/logger";

const VALID_STATUSES = ["NEW", "REPLIED", "CLOSED"];

/**
 * PATCH /api/admin/contact/[id]
 * Update a contact submission's status (admin only).
 */
export async function PATCH(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true, submission });
  } catch (error) {
    logError("api:admin:contact:PATCH", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
