import Link from "next/link";
import { getOrderByOrderNumber } from "@/features/orders/order.service";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Order Confirmation - WEJ Shoes",
};

export default async function OrderConfirmationPage({ params }) {
  const { orderNumber } = await params;
  const order = await getOrderByOrderNumber(orderNumber);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg
          className="mx-auto h-24 w-24 text-gray-300 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-500 mb-8">
          We couldn&apos;t find an order with number: {orderNumber}
        </p>
        <Link
          href="/"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500">
          Thank you for your order. We&apos;ll send you updates via{" "}
          {order.customerEmail || "phone"}.
        </p>
      </div>

      {/* Order Number */}
      <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 mb-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Order Number</p>
        <p className="text-2xl font-bold text-gray-900 tracking-wider">
          {order.orderNumber}
        </p>
        {!order.userId && (
          <p className="text-xs text-amber-600 mt-2">
            Save this order number to track your order
          </p>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {item.color}
                  {item.size && ` / ${item.size}`} × {item.quantity}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPrice(Number(item.totalPrice))}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className={Number(order.shippingFee) === 0 ? "text-green-600 font-medium" : ""}>
              {Number(order.shippingFee) === 0 ? "Free" : formatPrice(Number(order.shippingFee))}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2">
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(Number(order.totalAmount))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p>{order.address}</p>
          <p>
            {order.area}, {order.city}
          </p>
          <p>{order.customerPhone}</p>
          {order.customerEmail && <p>{order.customerEmail}</p>}
          {order.notes && (
            <p className="mt-2 text-gray-500 italic">Note: {order.notes}</p>
          )}
        </div>
      </div>

      {/* Payment & Delivery */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Payment Method</p>
            <p className="font-medium">Cash on Delivery (COD)</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Estimated Delivery</p>
            <p className="font-medium">3-5 business days</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Order Status</p>
            <p className="font-medium capitalize">{order.orderStatus.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Payment Status</p>
            <p className="font-medium capitalize">{order.paymentStatus.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/collections/men"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold text-center hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
        {order.userId && (
          <Link
            href="/account/orders"
            className="inline-block bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            View My Orders
          </Link>
        )}
      </div>
    </div>
  );
}
