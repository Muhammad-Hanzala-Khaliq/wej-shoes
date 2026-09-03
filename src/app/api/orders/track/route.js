import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const STATUS_FLOW = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "COMPLETED", label: "Completed" },
];

/**
 * Build order timeline based on current status
 * @param {string} currentStatus
 * @returns {Array} Timeline steps
 */
function buildTimeline(currentStatus) {
  if (currentStatus === "CANCELLED") {
    return STATUS_FLOW.map((step) => ({
      ...step,
      completed: false,
      current: false,
    }));
  }

  const currentIndex = STATUS_FLOW.findIndex((s) => s.status === currentStatus);

  return STATUS_FLOW.map((step, index) => ({
    status: step.status,
    label: step.label,
    completed: index < currentIndex,
    current: index === currentIndex,
  }));
}

/**
 * POST handler - Track order by order number + phone
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

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: {
        items: {
          select: {
            productName: true,
            color: true,
            size: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order number." },
        { status: 404 }
      );
    }

    // Validate phone matches
    const orderPhone = order.customerPhone.replace(/[\s-]/g, "");
    const inputPhone = phone.trim().replace(/[\s-]/g, "");

    if (orderPhone !== inputPhone) {
      return NextResponse.json(
        { error: "Phone number does not match our records." },
        { status: 403 }
      );
    }

    const statusLabels = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      statusLabel: statusLabels[order.orderStatus] || order.orderStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.productName,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        total: Number(item.totalPrice),
      })),
      totalAmount: Number(order.totalAmount),
      shippingAddress: {
        city: order.city,
        province: order.area,
      },
      timeline: buildTimeline(order.orderStatus),
    });
  } catch (error) {
    console.error("POST /api/orders/track error:", error);
    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 }
    );
  }
}
