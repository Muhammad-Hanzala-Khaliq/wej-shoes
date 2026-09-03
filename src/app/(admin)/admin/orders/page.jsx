"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: "20" });
        if (statusFilter) params.set("status", statusFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/orders?${params}`);
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
  }, [page, statusFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order number..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Search
            </button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Status</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Items</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">
                        {order.customerFirstName} {order.customerLastName}
                      </p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {order._count.items}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-800"}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * pagination.limit + 1} to{" "}
              {Math.min(page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} orders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
