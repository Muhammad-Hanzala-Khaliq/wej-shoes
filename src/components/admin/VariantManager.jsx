"use client";

import { useState } from "react";

const COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Brown",
  "Tan", "Navy", "Grey", "Pink", "Beige", "Gold", "Silver"
];

const SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

/**
 * Variant management component for products
 * @param {Object} props
 * @param {Array} props.variants - Array of variant objects
 * @param {Function} props.onChange - Callback with updated variants
 * @param {string} props.productSlug - Product slug for SKU generation
 */
export default function VariantManager({ variants = [], onChange, productSlug = "" }) {
  const [newVariant, setNewVariant] = useState({
    color: "",
    size: "",
    stockQuantity: 0,
  });
  const [addError, setAddError] = useState("");

  const generateSku = (color, size) => {
    const base = productSlug || "product";
    return `${base}-${color.toLowerCase()}-${size}`.replace(/\s+/g, "-");
  };

  const handleAddVariant = () => {
    setAddError("");

    if (!newVariant.color || !newVariant.size) {
      setAddError("Please select both color and size");
      return;
    }

    // Check for duplicate
    const isDuplicate = variants.some(
      (v) =>
        v.color.toLowerCase() === newVariant.color.toLowerCase() &&
        v.size.toLowerCase() === newVariant.size.toLowerCase()
    );

    if (isDuplicate) {
      setAddError("This color + size combination already exists");
      return;
    }

    const variant = {
      sku: generateSku(newVariant.color, newVariant.size),
      color: newVariant.color,
      size: newVariant.size,
      stockQuantity: newVariant.stockQuantity,
      status: "ACTIVE",
    };

    onChange([...variants, variant]);
    setNewVariant({ color: "", size: "", stockQuantity: 0 });
  };

  const handleRemoveVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    onChange(updated);
  };

  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

  return (
    <div className="space-y-4">
      {/* Add New Variant Section */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Variant</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <select
              value={newVariant.color}
              onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
            >
              <option value="">Select color</option>
              {COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Size</label>
            <select
              value={newVariant.size}
              onChange={(e) => setNewVariant((prev) => ({ ...prev, size: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
            >
              <option value="">Select size</option>
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Stock</label>
            <input
              type="number"
              min="0"
              value={newVariant.stockQuantity}
              onChange={(e) =>
                setNewVariant((prev) => ({
                  ...prev,
                  stockQuantity: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddVariant}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Variant
            </button>
          </div>
        </div>

        {addError && (
          <p className="text-sm text-red-600 mt-2">{addError}</p>
        )}
      </div>

      {/* Variants List */}
      {variants.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{variant.color}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{variant.size}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(e) =>
                          handleVariantChange(index, "stockQuantity", parseInt(e.target.value) || 0)
                        }
                        className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={variant.status}
                        onChange={(e) => handleVariantChange(index, "status", e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Variants: <span className="font-semibold">{variants.length}</span> | 
              Total Stock: <span className="font-semibold">{totalStock}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">No variants added yet. Add at least one variant above.</p>
        </div>
      )}
    </div>
  );
}