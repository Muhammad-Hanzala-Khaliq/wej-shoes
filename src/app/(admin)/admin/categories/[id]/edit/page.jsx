"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import { GENDERS } from "@/lib/constants";
import { getCategory, updateCategory, listCategories } from "@/lib/api/admin/categories";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [category, setCategory] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsFetching(true);
        setFetchError("");

        const [categoryData, categoriesData] = await Promise.all([
          getCategory(id),
          listCategories(),
        ]);

        setCategory(categoryData.category);
        setParentCategories(
          categoriesData.categories.filter((cat) => cat.id !== id)
        );
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => (prev ? { ...prev, [name]: value } : prev));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!category?.name || category.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!category?.gender) {
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
      await updateCategory(id, {
        name: category.name,
        slug: category.slug || undefined,
        gender: category.gender,
        parentId: category.parentId || null,
        status: category.status,
        imageUrl: category.imageUrl || null,
      });

      router.push("/admin/categories?success=updated");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (fetchError) {
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {fetchError}
        </div>
        <div className="mt-4">
          <Link
            href="/admin/categories"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Return to Categories
          </Link>
        </div>
      </div>
    );
  }

  if (!category) {
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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          Category not found.
        </div>
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
          value={category.name || ""}
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
          value={category.slug || ""}
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
            value={category.gender || "MEN"}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
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
            value={category.parentId || ""}
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
            value={category.status || "ACTIVE"}
            onChange={handleChange}
            disabled={isLoading}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <ImageUpload
          value={category.imageUrl || ""}
          onChange={(url) => setCategory((prev) => (prev ? { ...prev, imageUrl: url } : prev))}
          folder="categories"
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
