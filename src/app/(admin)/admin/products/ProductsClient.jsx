"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastProvider";
import { deleteProduct } from "@/lib/api/admin/products";
import { formatPrice } from "@/lib/utils";

function getCloudinaryThumb(url) {
  if (!url) return "";
  if (url.includes("cloudinary")) {
    return url.replace("/upload/", "/upload/w_100,h_100,c_fill,f_auto,q_auto/");
  }
  return url;
}

export default function ProductsClient({
  initialProducts,
  initialTotal,
  initialPage,
  initialTotalPages,
  categories,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, productId: null, productName: "" });
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "created") showToast("Product created successfully", "success");
    else if (success === "updated") showToast("Product updated successfully", "success");
  }, [searchParams, showToast]);

  useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setPage(initialPage);
    setTotalPages(initialTotalPages);
  }, [initialProducts, initialTotal, initialPage, initialTotalPages]);

  const pushParams = useCallback(
    (overrides) => {
      const params = new URLSearchParams();
      const s = overrides.search !== undefined ? overrides.search : search;
      const c = overrides.categoryId !== undefined ? overrides.categoryId : categoryId;
      const st = overrides.status !== undefined ? overrides.status : status;
      const g = overrides.gender !== undefined ? overrides.gender : gender;
      const p = overrides.page || 1;

      if (s) params.set("search", s);
      if (c) params.set("categoryId", c);
      if (st) params.set("status", st);
      if (g) params.set("gender", g);
      if (p > 1) params.set("page", String(p));

      router.push(`/admin/products?${params.toString()}`);
    },
    [search, categoryId, status, gender, router]
  );

  const debounceRef = useCallback(() => {
    let timer;
    return (fn, delay) => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }, []);

  const debouncer = debounceRef();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncer(() => pushParams({ search: value, page: 1 }), 500);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ open: true, productId: id, productName: name });
  };

  const handleDeleteConfirm = () => {
    const id = deleteConfirm.productId;
    if (!id) return;

    const previousProducts = products;
    const previousTotal = total;

    setDeleteConfirm({ open: false, productId: null, productName: "" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));

    deleteProduct(id)
      .then(() => {
        showToast("Product deleted", "success");
        router.refresh();
      })
      .catch(() => {
        setProducts(previousProducts);
        setTotal(previousTotal);
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
    return <span className={styles[productStatus] || "badge badge-neutral"}>{productStatus}</span>;
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
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{total} products total</p>
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
              defaultValue={search}
              onChange={handleSearchChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => pushParams({ categoryId: e.target.value, page: 1 })}
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
              onChange={(e) => pushParams({ status: e.target.value, page: 1 })}
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
              onChange={(e) => pushParams({ gender: e.target.value, page: 1 })}
              className="input"
            >
              <option value="">All Genders</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
            </select>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 card">
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mb-4" style={{ color: "var(--text-muted)" }}>No products found</p>
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
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
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
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: "var(--surface-soft)" }}>
                          {product.images && product.images.length > 0 ? (
                            <img src={getCloudinaryThumb(product.images[0].imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium" style={{ color: "var(--text-primary)" }}>{product.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{product.slug}</div>
                      </td>
                      <td>
                        <div style={{ color: "var(--text-primary)" }}>{product.category?.name}</div>
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${product.category?.gender === "MEN" ? "badge badge-brand" : "badge badge-neutral"}`}>
                          {product.category?.gender}
                        </span>
                      </td>
                      <td>
                        {product.salePrice ? (
                          <div>
                            <span className="font-medium" style={{ color: "var(--danger)" }}>{formatPrice(product.salePrice)}</span>
                            <span className="text-xs line-through ml-1" style={{ color: "var(--text-muted)" }}>{formatPrice(product.regularPrice)}</span>
                          </div>
                        ) : (
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatPrice(product.regularPrice)}</span>
                        )}
                      </td>
                      <td>
                        <span className="font-medium" style={{ color: getTotalStock(product.variants) === 0 ? "var(--danger)" : getTotalStock(product.variants) < 10 ? "var(--warning)" : "var(--text-primary)" }}>
                          {getTotalStock(product.variants)}
                        </span>
                      </td>
                      <td>{statusBadge(product.status)}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`} className="link">Edit</Link>
                          <button onClick={() => handleDeleteClick(product.id, product.name)} className="link" style={{ color: "var(--danger)" }}>Delete</button>
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
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => pushParams({ page: page - 1 })} disabled={page <= 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => pushParams({ page: page + 1 })} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
