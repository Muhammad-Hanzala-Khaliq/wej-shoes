"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getAccount } from "@/lib/api/account";

const statusBadges = {
  PENDING: "badge badge-warning",
  CONFIRMED: "badge badge-brand",
  PROCESSING: "badge badge-brand",
  SHIPPED: "badge badge-neutral",
  DELIVERED: "badge badge-success",
  COMPLETED: "badge badge-success",
  CANCELLED: "badge badge-danger",
};

function SkeletonBlock({ className }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: "var(--surface-soft)" }}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4 mb-6">
        <SkeletonBlock className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonBlock key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="card p-6">
      <SkeletonBlock className="h-5 w-36 mb-4" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-start">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
            <SkeletonBlock className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="card p-6">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <SkeletonBlock className="h-7 w-12 mx-auto" />
            <SkeletonBlock className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccountClient() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    async function fetchAccount() {
      setIsLoading(true);
      try {
        const json = await getAccount();
        setData(json);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccount();
  }, [sessionStatus]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const formatMemberDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
    });
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container-page max-w-6xl py-8">
        <h1 className="heading-lg mb-8">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ProfileSkeleton />
          </div>
          <div className="md:col-span-2 space-y-6">
            <OrdersSkeleton />
            <StatsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-page max-w-6xl py-8">
        <h1 className="heading-lg mb-8">My Account</h1>
        <div className="text-center py-16">
          <p style={{ color: "var(--text-muted)" }}>Failed to load account data.</p>
        </div>
      </div>
    );
  }

  const { user, recentOrders, stats } = data;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container-page max-w-6xl py-8">
      <h1 className="heading-lg mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ background: "var(--ink)" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="heading-md truncate">{user.name}</h2>
                <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                  {user.email}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Member since {formatMemberDate(user.createdAt)}
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/account/orders"
                className="block p-3 rounded-lg transition"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="font-medium">Orders</div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  View order history
                </div>
              </Link>
            </nav>

            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-full"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="heading-md mb-4">Recent Orders</h3>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="mb-4" style={{ color: "var(--text-muted)" }}>
                  No orders yet
                </p>
                <Link href="/collections/men" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-lg"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(order.createdAt)} · {order._count.items} item{order._count.items !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={statusBadges[order.orderStatus] || "badge badge-neutral"}>
                        {order.orderStatus}
                      </span>
                      <span className="font-semibold text-sm">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recentOrders.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <Link href="/account/orders" className="link text-sm">
                  View All Orders →
                </Link>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Total Orders
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.memberDuration}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Member For
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
