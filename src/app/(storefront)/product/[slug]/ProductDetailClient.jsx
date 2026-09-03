"use client";

import { useState } from "react";
import VariantSelector from "@/components/storefront/VariantSelector";
import AddToCartButton from "@/components/storefront/AddToCartButton";

export default function ProductDetailClient({ product, variants }) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  return (
    <div className="space-y-6">
      <VariantSelector
        variants={variants}
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariant}
      />

      <AddToCartButton
        variant={selectedVariant}
        product={product}
        disabled={!selectedVariant}
      />
    </div>
  );
}
