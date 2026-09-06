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
    PENDING: "badge badge-warning",
    CONFIRMED: "badge badge-brand",
    PROCESSING: "badge badge-brand",
    SHIPPED: "badge badge-neutral",
    DELIVERED: "badge badge-success",
    COMPLETED: "badge badge-success",
    CANCELLED: "badge badge-danger",
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container-page py-12">
        <h1 className="heading-lg mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 rounded w-32" style={{ background: 'var(--surface-soft)' }} />
                  <div className="h-3 rounded w-24" style={{ background: 'var(--surface-soft)' }} />
                </div>
                <div className="h-6 rounded w-20" style={{ background: 'var(--surface-soft)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="heading-lg mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto h-20 w-20 mb-4"
            style={{ color: 'var(--text-muted)' }}
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
          <h2 className="heading-md mb-2">No orders yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Start shopping to place your first order.</p>
          <Link
            href="/collections/men"
            className="btn btn-primary"
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
                className="card p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <Link
                      href={`/order/${order.orderNumber}`}
                      className="link"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {order._count.items} {order._count.items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={statusColors[order.orderStatus] || "badge badge-neutral"}>
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

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn btn-outline"
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
