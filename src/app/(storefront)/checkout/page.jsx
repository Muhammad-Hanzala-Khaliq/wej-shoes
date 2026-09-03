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

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart.items || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, cartLoading, router]);

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
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return null;
  }

  const shippingFee = cart.subtotal >= 5000 ? 0 : 200;
  const total = cart.subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {session ? (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Logged in as <span className="font-medium">{session.user.email}</span>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          Checking out as guest.{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>{" "}
          to track your orders.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      fieldErrors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John Doe"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      fieldErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="03XXXXXXXXX"
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Address Line 1 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      fieldErrors.addressLine1 ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="House #, Street, Area"
                  />
                  {fieldErrors.addressLine1 && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.addressLine1}</p>
                  )}
                </div>

                {/* Address Line 2 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Landmark, Near etc."
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      fieldErrors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Lahore"
                  />
                  {fieldErrors.city && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                  )}
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      fieldErrors.province ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.province && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.province}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="54000"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => {
                  const { product } = item;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        {product.image && (
                          <img
                            src={getOptimizedUrl(product.image, 120)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.variant.color}
                          {item.variant.size && ` / ${item.variant.size}`} × {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-0.5">
                          {formatPrice(product.salePrice ? product.salePrice * item.quantity : product.regularPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-gray-500">
                    Free shipping on orders over PKR 5,000
                  </p>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Payment Method</p>
                <p className="text-sm text-gray-600">Cash on Delivery (COD)</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

              <Link
                href="/cart"
                className="block w-full mt-3 text-center text-gray-600 hover:text-gray-900 text-sm py-2"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
