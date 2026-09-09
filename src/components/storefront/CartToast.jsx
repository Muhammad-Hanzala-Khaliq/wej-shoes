"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/features/cart/CartProvider";

export default function CartToast() {
  const { error } = useCart();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (error) {
      setMessage(error);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!visible || !message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white text-sm px-5 py-3 rounded-full shadow-lg pointer-events-none">
      {message}
    </div>
  );
}
