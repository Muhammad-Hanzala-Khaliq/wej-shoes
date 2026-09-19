"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";
import { GENDERS } from "@/lib/constants";
import { createCategory, updateCategory } from "@/lib/api/admin/categories";

export default function CategoryFormClient({ initialData, parentCategories }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    gender: initialData?.gender || "MEN",
    parentId: initialData?.parentId || "",
    status: initialData?.status || "ACTIVE",
    imageUrl: initialData?.imageUrl || "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
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
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        gender: formData.gender,
        parentId: formData.parentId || undefined,
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
      };

      if (isEdit) {
        await updateCategory(initialData.id, payload);
        router.push("/admin/categories?success=updated");
      } else {
        await createCategory(payload);
        router.push("/admin/categories?success=created");
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParents = parentCategories.filter((cat) => cat.id !== initialData?.id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/categories" className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Categories</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? "Edit Category" : "Add New Category"}</h1>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
        <Input label="Name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Sneakers" error={errors.name} required disabled={isLoading} />

        <Input label="Slug (optional)" type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated from name" error={errors.slug} disabled={isLoading} />

        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500 ml-0.5">*</span></label>
          <select name="gender" value={formData.gender} onChange={handleChange} disabled={isLoading} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white">
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">Parent Category (optional)</label>
          <select name="parentId" value={formData.parentId} onChange={handleChange} disabled={isLoading} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white">
            <option value="">None (top-level category)</option>
            {filteredParents.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.gender})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} disabled={isLoading} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1 bg-white">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          folder="categories"
        />

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" isLoading={isLoading}>{isEdit ? "Update Category" : "Create Category"}</Button>
          <Link href="/admin/categories"><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
