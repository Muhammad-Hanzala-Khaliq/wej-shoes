"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    gender: "MEN",
    parentId: "",
    status: "ACTIVE",
    imageUrl: "",
  });
  const [parentCategories, setParentCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/categories/${id}`),
          fetch("/api/admin/categories"),
        ]);

        if (!categoryRes.ok) {
          throw new Error("Category not found");
        }

        const categoryData = await categoryRes.json();
        const categoriesData = await categoriesRes.json();

        setFormData({
          name: categoryData.category.name,
          slug: categoryData.category.slug,
          gender: categoryData.category.gender,
          parentId: categoryData.category.parentId || "",
          status: categoryData.category.status,
          imageUrl: categoryData.category.imageUrl || "",
        });

        if (categoriesRes.ok) {
          setParentCategories(
            categoriesData.categories.filter((cat) => cat.id !== id)
          );
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
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
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          gender: formData.gender,
          parentId: formData.parentId || null,
          status: formData.status,
          imageUrl: formData.imageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      router.push("/admin/categories");
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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Categories
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Category</h1>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg border border-gray-200"
      >
        <Input
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Sneakers"
          error={errors.name}
          required
          disabled={isLoading}
        />

        <Input
          label="Slug (optional)"
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="auto-generated from name"
          error={errors.slug}
          disabled={isLoading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
          >
            <option value="MEN">Men</option>
            <option value="WOMEN">Women</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Parent Category (optional)
          </label>
          <select
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
          >
            <option value="">None (top-level category)</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.gender})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <Input
          label="Image URL (optional)"
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://..."
          error={errors.imageUrl}
          disabled={isLoading}
        />

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" isLoading={isLoading}>
            Update Category
          </Button>
          <Link href="/admin/categories">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
