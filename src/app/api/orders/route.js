import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { createOrder, getOrdersByUserId } from "@/features/orders/order.service";

/**
 * Validate Pakistani phone number
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPakistaniPhone(phone) {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(03[0-9]{2}-?[0-9]{7}|(\+92)3[0-9]{2}-?[0-9]{7})$/.test(cleaned);
}

/**
 * POST handler - Create a new order
 * No login required - guests can also order
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("guest_session_id")?.value || null;
    const session = await auth();
    const userId = session?.user?.id || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "Session required. Please add items to cart first." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { shippingAddress, notes } = body;

    // Validate shipping address
    const errors = {};

    if (!shippingAddress?.fullName || shippingAddress.fullName.trim().length < 2) {
      errors.fullName = "Full name is required (min 2 characters)";
    }

    if (!shippingAddress?.phone) {
      errors.phone = "Phone number is required";
    } else if (!isValidPakistaniPhone(shippingAddress.phone)) {
      errors.phone = "Invalid Pakistani phone number (e.g., 03XXXXXXXXX)";
    }

    if (!shippingAddress?.addressLine1 || shippingAddress.addressLine1.trim().length < 5) {
      errors.addressLine1 = "Address is required (min 5 characters)";
    }

    if (!shippingAddress?.city || shippingAddress.city.trim().length < 2) {
      errors.city = "City is required";
    }

    if (!shippingAddress?.province || shippingAddress.province.trim().length < 2) {
      errors.province = "Province is required";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const order = await createOrder({
      userId,
      sessionId,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        email: shippingAddress.email?.trim() || "",
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2?.trim() || "",
        city: shippingAddress.city.trim(),
        province: shippingAddress.province.trim(),
        postalCode: shippingAddress.postalCode?.trim() || "",
      },
      notes: notes?.trim() || null,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);

    if (error.message === "Cart is empty") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes("Insufficient stock") || error.message.includes("not available")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

/**
 * GET handler - List user orders
 * Requires logged-in user
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getOrdersByUserId(session.user.id, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
