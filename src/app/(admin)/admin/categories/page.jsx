"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastProvider";

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, categoryId: null, categoryName: "" });
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const success = searchParams.get("success");
    if (success === "created") {
      showToast("Category created successfully", "success");
    } else if (success === "updated") {
      showToast("Category updated successfully", "success");
    }
  }, [searchParams, showToast]);

  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ open: true, categoryId: id, categoryName: name });
  };

  const handleDeleteConfirm = () => {
    const id = deleteConfirm.categoryId;
    if (!id) return;

    setDeleteConfirm({ open: false, categoryId: null, categoryName: "" });
    setDeletingId(id);

    setTimeout(() => {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setDeletingId(null);
    }, 300);

    fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        showToast("Category deleted", "success");
      })
      .catch(() => {
        fetchCategories();
        showToast("Failed to delete category", "error");
      });
  };

  return (
    <div>
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, categoryId: null, categoryName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
        <Link href="/admin/categories/add">
          <Button>Add Category</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-gray-500">No categories found</p>
          <Link href="/admin/categories/add" className="mt-4 inline-block">
            <Button size="sm">Add your first category</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-all duration-300"
                    style={{
                      opacity: deletingId === category.id ? 0 : 1,
                      transform: deletingId === category.id ? "scale(0.95)" : "scale(1)",
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {category.parent && (
                        <div className="text-xs text-gray-500">
                          Parent: {category.parent.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{category.slug}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.gender === "MEN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {category.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category._count?.products || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(category.id, category.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
