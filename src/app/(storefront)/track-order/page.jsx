"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderNumber.trim()) {
      setError("Order number is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to track order");
        setIsLoading(false);
        return;
      }

      setOrder(data);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>

      {/* Tracking Form */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Number
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD-1234567890-1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Tracking..." : "Track Order"}
          </button>
        </form>
      </div>

      {/* Order Results */}
      {order && (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-xl font-bold">{order.orderNumber}</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                {order.statusLabel}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
            <div className="space-y-0">
              {order.timeline.map((step, index) => (
                <div key={step.status} className="flex items-start gap-4">
                  {/* Vertical line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        step.completed
                          ? "bg-green-500"
                          : step.current
                            ? "bg-blue-500 ring-4 ring-blue-100"
                            : "bg-gray-300"
                      }`}
                    />
                    {index < order.timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          step.completed ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  {/* Label */}
                  <div className="pb-8">
                    <p
                      className={`text-sm font-medium ${
                        step.completed || step.current
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="py-3 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.color}
                      {item.size && ` / ${item.size}`} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium text-gray-900">City: </span>
                {order.shippingAddress.city}
              </p>
              <p>
                <span className="font-medium text-gray-900">Province: </span>
                {order.shippingAddress.province}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
