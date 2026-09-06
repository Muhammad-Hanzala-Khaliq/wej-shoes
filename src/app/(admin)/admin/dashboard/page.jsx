"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STATUS_CLASSES = {
  PENDING: "badge badge-warning",
  CONFIRMED: "badge badge-brand",
  PROCESSING: "badge badge-brand",
  SHIPPED: "badge badge-success",
  DELIVERED: "badge badge-success",
  COMPLETED: "badge badge-success",
  CANCELLED: "badge badge-danger",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatPrice = (amount) =>
    `PKR ${Number(amount || 0).toLocaleString("en-PK")}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div>
        <h1 className="heading-lg mb-8" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="card h-24"
              style={{ background: "var(--surface)" }}
            >
              <div className="animate-pulse flex items-center gap-4 h-full">
                <div
                  className="w-12 h-12 rounded-lg"
                  style={{ background: "var(--border)" }}
                />
                <div className="flex-1">
                  <div
                    className="h-3 w-20 rounded mb-2"
                    style={{ background: "var(--border)" }}
                  />
                  <div
                    className="h-6 w-16 rounded"
                    style={{ background: "var(--border)" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="heading-lg mb-8" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <div className="card p-6">
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      sub: `${stats?.activeProducts ?? 0} active · ${stats?.draftProducts ?? 0} draft`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bg: "#3b82f6",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      sub: `${stats?.shippedOrders ?? 0} shipped · ${stats?.deliveredOrders ?? 0} delivered`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      bg: "#10b981",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      sub: "Excluding cancelled orders",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "#f59e0b",
    },
    {
      title: "Customers",
      value: stats?.totalCustomers ?? 0,
      sub: "Unique buyers",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: "#8b5cf6",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      sub: "Awaiting processing",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "#f97316",
      badge: (stats?.pendingOrders ?? 0) > 0,
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems ?? 0,
      sub: "Variants with ≤5 units",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bg: (stats?.lowStockItems ?? 0) > 0 ? "#ef4444" : "#14b8a6",
      badge: (stats?.lowStockItems ?? 0) > 0,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <Link href="/admin/products/add" className="btn btn-primary btn-sm">
          + Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-5" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                style={{ background: stat.bg }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {stat.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </p>
                  {stat.badge && (
                    <span className="badge badge-danger text-xs">!</span>
                  )}
                </div>
                {stat.sub && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {stat.sub}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="card" style={{ background: "var(--surface)" }}>
          <div
            className="flex items-center justify-between"
            style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="link text-sm">
              View All
            </Link>
          </div>
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              No orders yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="link"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {order.customerName}
                      </td>
                      <td style={{ color: "var(--text-primary)" }}>
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td>
                        <span className={STATUS_CLASSES[order.orderStatus] || "badge badge-neutral"}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card" style={{ background: "var(--surface)" }}>
          <div
            style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Low Stock Alert
            </h2>
          </div>
          {!stats?.lowStockVariants || stats.lowStockVariants.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              All items well stocked
            </div>
          ) : (
            <div>
              {stats.lowStockVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between"
                  style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {variant.productName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {variant.color}{variant.size ? ` / ${variant.size}` : ""}
                    </p>
                  </div>
                  <span
                    className={variant.stockQuantity === 0 ? "badge badge-danger" : "badge badge-warning"}
                  >
                    {variant.stockQuantity === 0 ? "Out of stock" : `${variant.stockQuantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6" style={{ background: "var(--surface)" }}>
        <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/add" className="btn btn-primary btn-sm">
            + Add Product
          </Link>
          <Link href="/admin/orders" className="btn btn-outline btn-sm">
            View Orders
          </Link>
          <Link href="/admin/products" className="btn btn-outline btn-sm">
            View Products
          </Link>
          <Link href="/admin/categories" className="btn btn-ghost btn-sm">
            Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
