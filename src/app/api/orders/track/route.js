import { NextResponse } from "next/server";
import { trackOrderByPhone } from "@/features/orders/order.service";
import { logError } from "@/lib/logger";

/**
 * POST handler - Track order by order number + phone (PUBLIC)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderNumber, phone } = body;

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: "Order number and phone number are required" },
        { status: 400 }
      );
    }

    const data = await trackOrderByPhone(orderNumber, phone);
    return NextResponse.json(data);
  } catch (error) {
    logError("/api/orders/track", error);

    if (error.message === "Order not found") {
      return NextResponse.json(
        { error: "Order not found. Please check your order number." },
        { status: 404 }
      );
    }
    if (error.message === "Phone mismatch") {
      return NextResponse.json(
        { error: "Phone number does not match our records." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 }
    );
  }
}
