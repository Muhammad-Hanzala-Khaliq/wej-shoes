"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const STATUS_FLOW = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
  { status: "COMPLETED", label: "Completed" },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { orderNumber } = params;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/by-number/${orderNumber}`);

        if (res.status === 401) {
          setError("Please login to view this order");
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          setError("Order not found");
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        const timeline = STATUS_FLOW.map((s, index) => {
          const currentIndex = STATUS_FLOW.findIndex((sf) => sf.status === data.orderStatus);
          return {
            ...s,
            completed: index < currentIndex,
            current: index === currentIndex,
          };
        });

        setOrder({
          ...data,
          status: data.orderStatus,
          statusLabel: data.orderStatus,
          totalAmount: Number(data.totalAmount),
          subtotal: Number(data.subtotal),
          shippingFee: Number(data.shippingFee),
          items: data.items || [],
          timeline,
        });
      } catch {
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", orderNumber }),
      });

      if (res.ok) {
        setOrder((prev) => ({
          ...prev,
          status: "CANCELLED",
          statusLabel: "Cancelled",
          timeline: prev.timeline.map((s) => ({
            ...s,
            completed: false,
            current: s.status === "CANCELLED",
          })),
        }));
      }
    } catch {
      // ignore
    } finally {
      setCancelling(false);
    }
  };

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-500 mb-6">{error || "We couldn't find this order."}</p>
        <Link
          href="/account/orders"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
            {order.statusLabel}
          </span>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
        <div className="flex items-center justify-between">
          {order.timeline.map((step, index) => (
            <div key={step.status} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : step.current
                      ? "bg-blue-500 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.completed ? "✓" : index + 1}
              </div>
              <p className={`text-xs mt-2 text-center ${
                step.completed || step.current ? "text-gray-900 font-medium" : "text-gray-400"
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-medium text-gray-600">Item</th>
                <th className="text-center py-2 font-medium text-gray-600">Qty</th>
                <th className="text-right py-2 font-medium text-gray-600">Price</th>
                <th className="text-right py-2 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{item.productName || item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.color}{item.size && ` / ${item.size}`}
                    </p>
                  </td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{formatPrice(Number(item.unitPrice || item.price))}</td>
                  <td className="py-3 text-right font-medium">{formatPrice(Number(item.totalPrice || item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2">
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {order.customerFirstName} {order.customerLastName}
            </p>
            <p>{order.address}</p>
            <p>{order.area}, {order.city}</p>
            <p>{order.customerPhone}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-3">Payment</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium text-gray-900">Method: </span>
              Cash on Delivery (COD)
            </p>
            <p>
              <span className="font-medium text-gray-900">Status: </span>
              {order.paymentStatus || "Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/account/orders"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to My Orders
        </Link>
      </div>
    </div>
  );
}
