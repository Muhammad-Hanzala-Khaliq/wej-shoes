"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice, validatePhone } from "@/lib/utils";
import { getCheckoutVariant, getShippingRules } from "@/lib/api/checkout";
import { placeOrder } from "@/lib/api/orders";
import { saveBuyNow, readBuyNow, clearBuyNow } from "@/lib/buy-now";
import { resolveShipping } from "@/lib/shipping";

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

export default function CheckoutClient({
  initialBuyNowItem = null,
  buyNowError = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { cart, isLoading: cartLoading, clearCart } = useCart();

  const buyNowVariantId = searchParams.get("variant");
  const buyNowQuantity = parseInt(searchParams.get("quantity") || "1", 10);
  const isBuyNow = searchParams.get("buyNow") === "true";

  const [buyNowItem, setBuyNowItem] = useState(initialBuyNowItem);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [buyNowFail, setBuyNowFail] = useState(
    buyNowError ? { message: buyNowError, slug: null } : null,
  );

  // True from the moment "Place Order" is clicked until this component
  // unmounts. Skips the empty-cart guard and shows the full-screen overlay
  // so the empty-cart state can never flash before the redirect to the
  // confirmation page completes.
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
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

  // Buy Now: the server passes the item when URL params are valid. Otherwise
  // fall back to the sessionStorage snapshot; if it expired, send the user
  // back to the product page with a message.
  useEffect(() => {
    if (!isBuyNow || initialBuyNowItem) return;

    async function loadBuyNow() {
      // Server already failed to resolve the URL variant (invalid / OOS)
      if (buyNowError) {
        const saved = readBuyNow();
        if (saved?.slug) {
          setBuyNowFail({ message: buyNowError, slug: saved.slug });
        }
        return;
      }

      setBuyNowLoading(true);
      try {
        // 1. URL param (primary source)
        if (buyNowVariantId) {
          const data = await getCheckoutVariant(buyNowVariantId);
          setBuyNowItem({ ...data, quantity: buyNowQuantity });
          saveBuyNow({
            variantId: data.id,
            quantity: buyNowQuantity,
            slug: data.slug,
          });
          setBuyNowFail(null);
          return;
        }

        // 2. sessionStorage fallback
        const saved = readBuyNow();
        if (saved && !saved.expired) {
          const data = await getCheckoutVariant(saved.variantId);
          setBuyNowItem({
            ...data,
            quantity: saved.quantity || buyNowQuantity,
          });
          return;
        }
        if (saved?.slug) {
          // Expired session → back to the product page with a message
          router.push(`/product/${saved.slug}?expired=1`);
          return;
        }
        router.push("/cart");
      } catch {
        // Variant deleted or out of stock at checkout time
        const saved = readBuyNow();
        if (saved?.slug && saved.expired) {
          router.push(`/product/${saved.slug}?expired=1`);
        } else {
          setBuyNowFail({
            message:
              "This size is out of stock or no longer available. Please choose another size.",
            slug: saved?.slug || null,
          });
        }
      } finally {
        setBuyNowLoading(false);
      }
    }
    loadBuyNow();
  }, [
    isBuyNow,
    initialBuyNowItem,
    buyNowError,
    buyNowVariantId,
    buyNowQuantity,
    router,
  ]);

  // Note: an empty cart renders a friendly "Your cart is empty" state below
  // (no redirect) — this also covers checkout opened directly via URL.

  useEffect(() => {
    async function fetchShippingRules() {
      try {
        const data = await getShippingRules();
        setShippingRules(data);
      } catch {}
    }
    fetchShippingRules();
  }, []);

  // Auto-dismiss the error toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

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
      if (!validatePhone(form.phone)) {
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
    if (isPlacingOrder || orderPlaced) return; // guard against double submit
    setError("");
    if (!validate()) return;
    setIsPlacingOrder(true); // set FIRST — overlay must cover the whole submit window

    // Build the items list from what the form was given (Buy Now item or cart).
    // Only variantId + quantity are sent — the server re-reads all prices,
    // stock, and totals from the database.
    const items =
      isBuyNow && buyNowItem
        ? [
            {
              productId: buyNowItem.productId,
              variantId: buyNowItem.id,
              quantity: buyNowItem.quantity,
            },
          ]
        : (cart.items || [])
            .filter((item) => item.variantId && item.product?.id)
            .map((item) => ({
              productId: item.product.id,
              variantId: item.variantId,
              quantity: item.quantity,
            }));

    if (items.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.");
      setIsPlacingOrder(false);
      return;
    }

    try {
      const data = await placeOrder({
        items,
        buyNow: isBuyNow,
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
      });

      if (data.errors) {
        setFieldErrors(data.errors);
        setIsPlacingOrder(false);
        return;
      }
      if (data.error) {
        setError(data.error);
        setToast(data.error);
        setIsPlacingOrder(false);
        return;
      }

      // ── Success ──────────────────────────────────────────────────────────
      // The server already cleared the DB cart inside this same request.
      // Start navigation FIRST, then drop the local cart — together with the
      // isPlacingOrder overlay (and the skipped empty-cart guard) this makes
      // the empty-cart flash impossible before the confirmation page loads.
      setOrderPlaced(true);
      router.push(`/order-confirmation/${data.orderNumber}`);
      if (isBuyNow) {
        clearBuyNow(); // Buy Now never touched the cart — just drop the session
      } else {
        clearCart(); // never rejects; CartProvider lives in the layout and survives navigation
      }
      // isPlacingOrder intentionally stays true until unmount (overlay covers the transition)
    } catch {
      setError("An error occurred. Please try again.");
      setToast("An error occurred. Please try again.");
      setIsPlacingOrder(false); // hides overlay, keeps cart intact
    }
  };

  // Full-screen processing overlay + transient error toast. Rendered in EVERY
  // return path below so nothing (empty-cart state, skeleton) can flash while
  // the order is being placed or right after it succeeds.
  const processingChrome = (
    <>
      {isPlacingOrder && (
        <div
          className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-200 border-t-black" />
          <p
            className="mt-5 text-sm font-semibold text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Your Order is Processing...
          </p>
          <p
            className="mt-1 text-xs text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Please wait, do not close this window.
          </p>
        </div>
      )}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] max-w-[90vw] px-4 py-3 rounded-lg shadow-lg text-sm text-white text-center"
          style={{ background: "var(--danger)" }}
          role="alert"
        >
          {toast}
        </div>
      )}
    </>
  );

  const waitingForBuyNow = isBuyNow && !buyNowItem && !buyNowFail;

  if (buyNowLoading || waitingForBuyNow || (!isBuyNow && cartLoading)) {
    return (
      <div className="container-page section">
        {processingChrome}
        <div className="animate-pulse space-y-4">
          <div
            className="h-8 rounded w-1/4"
            style={{ background: "var(--surface-soft)" }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded"
                  style={{ background: "var(--surface-soft)" }}
                />
              ))}
            </div>
            <div
              className="h-64 rounded"
              style={{ background: "var(--surface-soft)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Buy Now failed (expired session / variant gone / out of stock)
  if (isBuyNow && !buyNowItem && buyNowFail) {
    return (
      <div className="container-page section">
        {processingChrome}
        <h1
          className="heading-lg mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          Checkout
        </h1>
        <div className="card p-6 max-w-xl">
          <div
            className="p-4 rounded-lg text-sm mb-4"
            style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
            role="alert"
          >
            {buyNowFail.message}
          </div>
          <div className="flex flex-wrap gap-3">
            {buyNowFail.slug && (
              <Link
                href={`/product/${buyNowFail.slug}`}
                className="btn btn-primary"
              >
                Choose another size
              </Link>
            )}
            <Link href="/" className="btn btn-ghost">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayItems = isBuyNow && buyNowItem ? [buyNowItem] : cart.items || [];
  const displaySubtotal =
    isBuyNow && buyNowItem
      ? (buyNowItem.salePrice || buyNowItem.regularPrice) * buyNowItem.quantity
      : cart.subtotal;

  // Friendly empty-cart state — skipped while an order is being placed:
  // the cart empties on success, and this state must never flash between
  // "Place Order" and the redirect to the confirmation page.
  if (!isPlacingOrder && displayItems.length === 0) {
    return (
      <div className="container-page section">
        {processingChrome}
        <h1
          className="heading-lg mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          Checkout
        </h1>
        <div className="card p-8 text-center max-w-xl">
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            Your cart is empty.
          </p>
          <Link href="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Product page link shown when an item ran out of stock at order time
  const stockErrorSlug = isBuyNow
    ? buyNowItem?.slug || buyNowFail?.slug || ""
    : cart.items?.[0]?.product?.slug || "";

  // Same shared calculation the server uses when saving the order
  const { fee: finalShippingFee, freeShippingThreshold } = resolveShipping(
    shippingRules,
    displaySubtotal,
  );
  const total = displaySubtotal + finalShippingFee;

  return (
    <div className="container-page section">
      {processingChrome}
      <h1 className="heading-lg mb-8" style={{ color: "var(--text-primary)" }}>
        Checkout
      </h1>

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
          style={{
            background: "var(--surface-soft)",
            color: "var(--text-secondary)",
          }}
        >
          Checking out as guest.{" "}
          <Link href="/login" className="link">
            Login
          </Link>{" "}
          to track your orders.
        </div>
      )}

      {error && (
        <div
          className="mb-6 p-4 rounded-lg text-sm"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          role="alert"
        >
          <span>{error}</span>
          {stockErrorSlug && /stock|available/i.test(error) && (
            <>
              {" "}
              <Link
                href={`/product/${stockErrorSlug}`}
                className="underline font-medium"
              >
                Choose another size
              </Link>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2
                className="heading-md mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Shipping Address
              </h2>
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
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--danger)" }}
                    >
                      {fieldErrors.fullName}
                    </p>
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
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--danger)" }}
                    >
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">
                    Email{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      (optional)
                    </span>
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
                    Address Line 1{" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
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
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--danger)" }}
                    >
                      {fieldErrors.addressLine1}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">
                    Address Line 2{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      (optional)
                    </span>
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
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--danger)" }}
                    >
                      {fieldErrors.city}
                    </p>
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
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.province && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--danger)" }}
                    >
                      {fieldErrors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Postal Code{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      (optional)
                    </span>
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
                    Order Notes{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      (optional)
                    </span>
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
            <div
              className="card p-6 sticky top-24"
              style={{ background: "var(--surface-soft)" }}
            >
              <h2
                className="heading-md mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {displayItems.map((item) => {
                  const itemProduct = isBuyNow ? item : item.product;
                  const itemVariant = isBuyNow ? item : item.variant;
                  const itemName = isBuyNow
                    ? item.productName
                    : item.product.name;
                  const itemImage = isBuyNow ? item.image : item.product.image;
                  const itemQuantity = isBuyNow ? item.quantity : item.quantity;
                  const itemPrice = isBuyNow
                    ? (item.salePrice || item.regularPrice) * item.quantity
                    : item.product.salePrice
                      ? item.product.salePrice * item.quantity
                      : item.product.regularPrice * item.quantity;
                  const itemColor = isBuyNow ? item.color : item.variant.color;
                  const itemSize = isBuyNow ? item.size : item.variant.size;

                  return (
                    <div
                      key={item.id || buyNowVariantId}
                      className="flex gap-3"
                    >
                      <div
                        className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden"
                        style={{ background: "var(--surface)" }}
                      >
                        {itemImage && (
                          <div className="relative w-full h-full">
                            <Image
                              src={getOptimizedUrl(itemImage, 120)}
                              alt={itemName}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium line-clamp-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {itemName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {itemColor}
                          {itemSize && ` / ${itemSize}`} &times; {itemQuantity}
                        </p>
                        <p
                          className="text-sm font-medium mt-0.5"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatPrice(itemPrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className="space-y-2 text-sm"
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "1rem",
                }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Subtotal
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {formatPrice(displaySubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Shipping
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        finalShippingFee === 0
                          ? "var(--success)"
                          : "var(--text-primary)",
                    }}
                  >
                    {finalShippingFee === 0
                      ? "Free"
                      : formatPrice(finalShippingFee)}
                  </span>
                </div>
                {finalShippingFee > 0 && freeShippingThreshold && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Free shipping on orders over PKR{" "}
                    {freeShippingThreshold.toLocaleString("en-PK")}
                  </p>
                )}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div className="flex justify-between text-base font-semibold">
                    <span style={{ color: "var(--text-primary)" }}>Total</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="mt-4 p-3 rounded-lg"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Payment Method
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cash on Delivery (COD)
                </p>
              </div>

              <button
                type="submit"
                disabled={isPlacingOrder}
                className="btn btn-primary btn-full mt-6"
              >
                {isPlacingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
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
