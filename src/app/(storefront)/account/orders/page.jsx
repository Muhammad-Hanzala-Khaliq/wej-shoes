"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";

export default function OrderHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchOrders() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/orders?page=${page}&limit=10`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
          setPagination(data.pagination);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [status, page]);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse border border-gray-100">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-20 w-20 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to place your first order.</p>
          <Link
            href="/collections/men"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <Link
                      href={`/order/${order.orderNumber}`}
                      className="font-semibold text-gray-900 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order._count.items} {order._count.items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-800"}`}>
                      {order.orderStatus}
                    </span>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(Number(order.totalAmount))}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
