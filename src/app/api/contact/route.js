import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkRateLimit, incrementAttempts } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

/**
 * POST /api/contact
 * Submit a contact form message.
 * Rate limit: 3 submissions per email per hour.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // ── Validation ──────────────────────────────────────
    const errors = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Name is required (min 2 characters)";
    } else if (name.trim().length > 100) {
      errors.name = "Name must be 100 characters or fewer";
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Valid email is required";
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.message = "Message is required (min 10 characters)";
    } else if (message.trim().length > 2000) {
      errors.message = "Message must be 2000 characters or fewer";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // ── Rate limit ──────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    const rateKey = `contact:${normalizedEmail}`;
    const { allowed } = checkRateLimit(rateKey, 3, 60 * 60 * 1000); // 3 per hour

    if (!allowed) {
      return NextResponse.json(
        { ok: false, errors: { email: "Too many submissions. Please try again later." } },
        { status: 429 }
      );
    }

    // ── Save to DB ──────────────────────────────────────
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        subject: subject || "General Inquiry",
        message: message.trim(),
        status: "NEW",
      },
    });

    // Record attempt for rate limiting
    incrementAttempts(rateKey);

    return NextResponse.json({ ok: true, id: submission.id }, { status: 201 });
  } catch (error) {
    logError("api:contact:POST", error);
    return NextResponse.json(
      { ok: false, errors: { form: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}
