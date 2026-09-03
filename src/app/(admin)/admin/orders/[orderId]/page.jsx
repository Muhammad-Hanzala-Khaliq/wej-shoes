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

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { orderId } = params;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (res.status === 401) {
          router.push("/admin-login");
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, router]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === "CANCELLED") {
      setShowCancel(true);
      return;
    }

    if (!confirm(`Update status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder((prev) => ({ ...prev, ...updated }));
      }
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "CANCELLED",
          reason: cancelReason || "Cancelled by admin",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder((prev) => ({ ...prev, ...updated }));
        setShowCancel(false);
        setCancelReason("");
      }
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <Link href="/admin/orders" className="text-gray-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const nextStatuses = VALID_TRANSITIONS[order.orderStatus] || [];
  const timelineIndex = STATUS_FLOW.findIndex((s) => s.status === order.orderStatus);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold mt-1">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            Placed {new Date(order.createdAt).toLocaleString("en-PK")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.orderStatus]}`}>
            {order.orderStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((step, index) => (
                <div key={step.status} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < timelineIndex
                        ? "bg-green-500 text-white"
                        : index === timelineIndex
                          ? "bg-blue-500 text-white ring-4 ring-blue-100"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < timelineIndex ? "✓" : index + 1}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    index <= timelineIndex ? "text-gray-900 font-medium" : "text-gray-400"
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-600">Item</th>
                    <th className="text-center py-2 font-medium text-gray-600">SKU</th>
                    <th className="text-center py-2 font-medium text-gray-600">Qty</th>
                    <th className="text-right py-2 font-medium text-gray-600">Price</th>
                    <th className="text-right py-2 font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.color} / {item.size}</p>
                      </td>
                      <td className="py-3 text-center text-gray-500 text-xs">{item.sku}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatPrice(Number(item.unitPrice))}</td>
                      <td className="py-3 text-right font-medium">{formatPrice(Number(item.totalPrice))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{Number(order.shippingFee) === 0 ? "Free" : formatPrice(Number(order.shippingFee))}</span>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.totalAmount))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{entry.status}</p>
                    <p className="text-gray-500">{entry.notes}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleString("en-PK")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            {nextStatuses.length > 0 ? (
              <div className="space-y-2">
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                      status === "CANCELLED"
                        ? "border-red-300 text-red-600 hover:bg-red-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    {status === "CANCELLED" ? "Cancel Order" : `Mark as ${status}`}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No status updates available.</p>
            )}

            {/* Cancel Reason Modal */}
            {showCancel && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter reason for cancellation..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {updating ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                  <button
                    onClick={() => { setShowCancel(false); setCancelReason(""); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-3">Customer</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">
                {order.customerFirstName} {order.customerLastName}
              </p>
              <p>{order.customerPhone}</p>
              {order.customerEmail && <p>{order.customerEmail}</p>}
              {order.user && (
                <p className="text-xs text-gray-400">
                  Account: {order.user.email}
                </p>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-3">Shipping</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.address}</p>
              <p>{order.area}, {order.city}</p>
              {order.notes && (
                <p className="text-gray-500 italic mt-2">Note: {order.notes}</p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-3">Payment</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium text-gray-900">Method: </span>
                {order.paymentMethod}
              </p>
              <p>
                <span className="font-medium text-gray-900">Status: </span>
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
