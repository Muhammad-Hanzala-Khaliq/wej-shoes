"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "Islamabad",
  "AJK",
  "Gilgit-Baltistan",
];

function getOptimizedUrl(url, width) {
  if (!url || !url.includes("cloudinary")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, isLoading: cartLoading } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [shippingRules, setShippingRules] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  useEffect(() => {
    if (!cartLoading && (!cart.items || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, cartLoading, router]);

  useEffect(() => {
    async function fetchShippingRules() {
      try {
        const res = await fetch("/api/shipping-rules");
        if (res.ok) {
          const data = await res.json();
          setShippingRules(data);
        }
      } catch {}
    }
    fetchShippingRules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName || form.fullName.trim().length < 2) {
      errors.fullName = "Full name is required";
    }
    if (!form.phone) {
      errors.phone = "Phone number is required";
    } else {
      const cleaned = form.phone.replace(/[\s-]/g, "");
      if (!/^(03[0-9]{2}-?[0-9]{7}|(\+92)3[0-9]{2}-?[0-9]{7})$/.test(cleaned)) {
        errors.phone = "Invalid Pakistani phone (e.g., 03XXXXXXXXX)";
      }
    }
    if (!form.addressLine1 || form.addressLine1.trim().length < 5) {
      errors.addressLine1 = "Address is required (min 5 characters)";
    }
    if (!form.city || form.city.trim().length < 2) {
      errors.city = "City is required";
    }
    if (!form.province) {
      errors.province = "Province is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            province: form.province,
            postalCode: form.postalCode.trim(),
          },
          notes: form.notes.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setError(data.error || "Failed to place order");
        }
        setIsSubmitting(false);
        return;
      }
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch {
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="container-page section">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded w-1/4" style={{ background: "var(--surface-soft)" }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded" style={{ background: "var(--surface-soft)" }} />
              ))}
            </div>
            <div className="h-64 rounded" style={{ background: "var(--surface-soft)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) return null;

  let shippingFee = 200;
  let freeShippingThreshold = 5000;
  if (shippingRules.length > 0) {
    const activeRule = shippingRules.find((r) => r.type === "FLAT" || r.type === "FREE") || shippingRules[0];
    if (activeRule) {
      shippingFee = Number(activeRule.amount) || 0;
      freeShippingThreshold = activeRule.freeShippingThreshold ? Number(activeRule.freeShippingThreshold) : null;
    }
  }
  const qualifiesForFreeShipping = freeShippingThreshold && cart.subtotal >= freeShippingThreshold;
  const finalShippingFee = qualifiesForFreeShipping ? 0 : shippingFee;
  const total = cart.subtotal + finalShippingFee;

  return (
    <div className="container-page section">
      <h1 className="heading-lg mb-8" style={{ color: "var(--text-primary)" }}>Checkout</h1>

      {session ? (
        <div
          className="mb-6 p-3 rounded-lg text-sm"
          style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
        >
          Logged in as <span className="font-medium">{session.user.email}</span>
        </div>
      ) : (
        <div
          className="mb-6 p-3 rounded-lg text-sm"
          style={{ background: "var(--surface-soft)", color: "var(--text-secondary)" }}
        >
          Checking out as guest.{" "}
          <Link href="/login" className="link">Login</Link>{" "}
          to track your orders.
        </div>
      )}

      {error && (
        <div
          className="mb-6 p-4 rounded-lg text-sm"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="heading-md mb-4" style={{ color: "var(--text-primary)" }}>Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Full Name <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className={`input ${fieldErrors.fullName ? "input-error" : ""}`}
                    placeholder="John Doe"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Phone <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`input ${fieldErrors.phone ? "input-error" : ""}`}
                    placeholder="03XXXXXXXXX"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">
                    Email <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">
                    Address Line 1 <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    className={`input ${fieldErrors.addressLine1 ? "input-error" : ""}`}
                    placeholder="House #, Street, Area"
                  />
                  {fieldErrors.addressLine1 && (
                    <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.addressLine1}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">
                    Address Line 2 <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="input"
                    placeholder="Landmark, Near etc."
                  />
                </div>

                <div>
                  <label className="label">
                    City <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={`input ${fieldErrors.city ? "input-error" : ""}`}
                    placeholder="Lahore"
                  />
                  {fieldErrors.city && (
                    <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Province <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={`input ${fieldErrors.province ? "input-error" : ""}`}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {fieldErrors.province && (
                    <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{fieldErrors.province}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Postal Code <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="input"
                    placeholder="54000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">
                    Order Notes <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="input"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24" style={{ background: "var(--surface-soft)" }}>
              <h2 className="heading-md mb-4" style={{ color: "var(--text-primary)" }}>Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => {
                  const { product } = item;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div
                        className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden"
                        style={{ background: "var(--surface)" }}
                      >
                        {product.image && (
                          <img
                            src={getOptimizedUrl(product.image, 120)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1" style={{ color: "var(--text-primary)" }}>
                          {product.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.variant.color}{item.variant.size && ` / ${item.variant.size}`} &times; {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                          {formatPrice(product.salePrice ? product.salePrice * item.quantity : product.regularPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                  <span style={{ color: "var(--text-primary)" }}>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                  <span
                    className="font-medium"
                    style={{ color: finalShippingFee === 0 ? "var(--success)" : "var(--text-primary)" }}
                  >
                    {finalShippingFee === 0 ? "Free" : formatPrice(finalShippingFee)}
                  </span>
                </div>
                {finalShippingFee > 0 && freeShippingThreshold && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Free shipping on orders over PKR {freeShippingThreshold.toLocaleString()}
                  </p>
                )}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                  <div className="flex justify-between text-base font-semibold">
                    <span style={{ color: "var(--text-primary)" }}>Total</span>
                    <span style={{ color: "var(--text-primary)" }}>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Payment Method</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Cash on Delivery (COD)</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-full mt-6"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>

              <Link href="/cart" className="btn btn-ghost btn-full mt-3">
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
