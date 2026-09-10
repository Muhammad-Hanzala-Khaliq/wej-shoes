"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastProvider";

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
}

function getCloudinaryThumb(url) {
  if (!url) return "";
  if (url.includes("cloudinary")) {
    return url.replace("/upload/", "/upload/w_100,h_100,c_fill,f_auto,q_auto/");
  }
  return url;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, productId: null, productName: "" });
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (status) params.set("status", status);
      if (gender) params.set("gender", gender);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(1);

    const success = searchParams.get("success");
    if (success === "created") {
      showToast("Product created successfully", "success");
    } else if (success === "updated") {
      showToast("Product updated successfully", "success");
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [categoryId, status, gender]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchProducts(newPage);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ open: true, productId: id, productName: name });
  };

  const handleDeleteConfirm = () => {
    const id = deleteConfirm.productId;
    if (!id) return;

    setDeleteConfirm({ open: false, productId: null, productName: "" });
    setDeletingId(id);

    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
      setTotal((prev) => Math.max(0, prev - 1));
    }, 300);

    fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        showToast("Product deleted", "success");
      })
      .catch(() => {
        fetchProducts(page);
        showToast("Failed to delete product", "error");
      });
  };

  const getTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  };

  const statusBadge = (productStatus) => {
    const styles = {
      ACTIVE: "badge badge-success",
      DRAFT: "badge badge-warning",
      ARCHIVED: "badge badge-neutral",
    };
    return (
      <span className={styles[productStatus] || "badge badge-neutral"}>
        {productStatus}
      </span>
    );
  };

  return (
    <div>
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, productId: null, productName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg">Products Management</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{total} products total</p>
        </div>
        <Link href="/admin/products/add">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by name or slug..."
              onChange={handleSearchChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.gender})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="label">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="input"
            >
              <option value="">All Genders</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 card">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--text-muted)' }}
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
          <p className="mb-4" style={{ color: 'var(--text-muted)' }}>No products found</p>
          <Link href="/admin/products/add">
            <Button size="sm">Add your first product</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table">
                <thead>
                  <tr>
                    <th>
                      Image
                    </th>
                    <th>
                      Name
                    </th>
                    <th>
                      Category
                    </th>
                    <th>
                      Price
                    </th>
                    <th>
                      Stock
                    </th>
                    <th>
                      Status
                    </th>
                    <th style={{ textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-all duration-300"
                      style={{
                        opacity: deletingId === product.id ? 0 : 1,
                        transform: deletingId === product.id ? "scale(0.95)" : "scale(1)",
                      }}
                    >
                      <td>
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: 'var(--surface-soft)' }}>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={getCloudinaryThumb(product.images[0].imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg
                              className="w-6 h-6"
                              style={{ color: 'var(--text-muted)' }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.slug}</div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>{product.category?.name}</div>
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                            product.category?.gender === "MEN"
                              ? "badge badge-brand"
                              : "badge badge-neutral"
                          }`}
                        >
                          {product.category?.gender}
                        </span>
                      </td>
                      <td>
                        {product.salePrice ? (
                          <div>
                            <span className="font-medium" style={{ color: 'var(--danger)' }}>
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-xs line-through ml-1" style={{ color: 'var(--text-muted)' }}>
                              {formatPrice(product.regularPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formatPrice(product.regularPrice)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className="font-medium"
                          style={{
                            color: getTotalStock(product.variants) === 0
                              ? 'var(--danger)'
                              : getTotalStock(product.variants) < 10
                                ? 'var(--warning)'
                                : 'var(--text-primary)'
                          }}
                        >
                          {getTotalStock(product.variants)}
                        </span>
                      </td>
                      <td>
                        {statusBadge(product.status)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="link"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product.id, product.name)}
                            className="link"
                            style={{ color: 'var(--danger)' }}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
