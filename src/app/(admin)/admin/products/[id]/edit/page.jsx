"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/admin/ImageUploader";
import VariantManager from "@/components/admin/VariantManager";

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Edit product page with image upload and variant management
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    status: "DRAFT",
    isFeatured: false,
  });
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories"),
        ]);

        if (!productRes.ok) {
          setNotFound(true);
          return;
        }

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        const product = productData.product;

        setFormData({
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description || "",
          regularPrice: product.regularPrice.toString(),
          salePrice: product.salePrice ? product.salePrice.toString() : "",
          status: product.status,
          isFeatured: product.isFeatured,
        });

        setImages(
          product.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            cloudinaryPublicId: img.cloudinaryPublicId,
            altText: img.altText || "",
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          }))
        );

        setVariants(
          product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            color: v.color,
            size: v.size,
            stockQuantity: v.stockQuantity,
            status: v.status,
          }))
        );

        if (categoriesRes.ok) {
          setCategories(categoriesData.categories);
        }
      } catch (err) {
        setServerError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === "name" && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.regularPrice || parseFloat(formData.regularPrice) <= 0) {
      newErrors.regularPrice = "Regular price must be greater than 0";
    }

    if (
      formData.salePrice &&
      parseFloat(formData.salePrice) >= parseFloat(formData.regularPrice)
    ) {
      newErrors.salePrice = "Sale price must be less than regular price";
    }

    if (variants.length > 0) {
      const seen = {};
      variants.forEach((v, i) => {
        const key = `${v.color?.toLowerCase()}-${v.size?.toLowerCase()}`;
        if (seen[key] !== undefined) {
          newErrors[`variant_${i}`] = "Duplicate color + size combination";
        } else {
          seen[key] = i;
        }
        if (!v.sku) {
          newErrors[`variant_sku_${i}`] = "SKU is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        regularPrice: parseFloat(formData.regularPrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images: images.map((img, i) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          cloudinaryPublicId: img.cloudinaryPublicId,
          altText: img.altText,
          sortOrder: i,
          isPrimary: img.isPrimary,
        })),
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          stockQuantity: v.stockQuantity || 0,
          status: v.status || "ACTIVE",
        })),
      };

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/admin/products");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to Products
          </Link>
        </div>
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Link href="/admin/products">
            <Button>Go to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Products
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Running Sneakers"
              error={errors.name}
              required
              disabled={isLoading}
            />
            <Input
              label="Slug"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="auto-generated from name"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isLoading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.gender})
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description (optional)"
                disabled={isLoading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Regular Price"
              type="number"
              name="regularPrice"
              value={formData.regularPrice}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.regularPrice}
              required
              disabled={isLoading}
            />
            <Input
              label="Sale Price (optional)"
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.salePrice}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Visibility</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Variants</h2>
          <VariantManager
            variants={variants}
            onChange={setVariants}
            productSlug={formData.slug}
          />
          {Object.keys(errors)
            .filter((k) => k.startsWith("variant_"))
            .map((key) => (
              <p key={key} className="text-sm text-red-600 mt-2">
                {errors[key]}
              </p>
            ))}
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isLoading}>
            Update Product
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
