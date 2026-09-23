import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { createOrder, getOrdersByUserId } from "@/features/orders/order.service";
import { logError } from "@/lib/logger";
import { validatePhone } from "@/lib/utils";

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

    const body = await request.json();
    const { shippingAddress, notes, items, buyNow } = body;

    // ── Validate items array when provided (Buy Now or cart checkout) ─────
    // Only variantId + quantity are trusted — all prices come from the DB.
    let parsedItems;
    if (items !== undefined && items !== null) {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
      }

      parsedItems = [];
      for (const item of items) {
        if (!item?.productId || !item?.variantId) {
          return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
        }
        const quantity = parseInt(item.quantity, 10);
        if (!Number.isInteger(quantity) || quantity < 1) {
          return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
        }
        parsedItems.push({
          productId: String(item.productId),
          variantId: String(item.variantId),
          quantity,
        });
      }
    }

    // A session is only required when falling back to the DB cart
    // (Buy Now sends its own items, so it works even without a cart session)
    if (!parsedItems && !userId && !sessionId) {
      return NextResponse.json(
        { error: "Session required. Please add items to cart first." },
        { status: 400 }
      );
    }

    // Validate shipping address
    const errors = {};

    if (!shippingAddress?.fullName || shippingAddress.fullName.trim().length < 2) {
      errors.fullName = "Full name is required (min 2 characters)";
    }

    if (!shippingAddress?.phone) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(shippingAddress.phone)) {
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
      items: parsedItems,
      // Buy Now never has a cart to clear; regular checkout clears the cart
      clearCart: buyNow !== true,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    logError("POST /api/orders", error);

    const msg = error.message || "";
    if (
      msg === "Cart is empty" ||
      msg === "Your cart is empty" ||
      msg === "Invalid cart items" ||
      msg === "userId or sessionId is required" ||
      msg.includes("Insufficient stock") ||
      msg.includes("not available") ||
      msg.includes("no longer available") ||
      msg.includes("not active")
    ) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    logError("GET /api/orders", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
