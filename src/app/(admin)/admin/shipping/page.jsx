"use client";

import { useState, useEffect, useCallback } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Pagination from "@/components/admin/Pagination";
import {
  getShippingRules,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
} from "@/lib/api/admin/cms";

const PAGE_SIZE = 20;

const SHIPPING_TYPES = [
  { value: "FLAT", label: "Flat Rate" },
  { value: "WEIGHT", label: "Weight Based" },
  { value: "FREE", label: "Free Shipping" },
];

const emptyRule = {
  name: "",
  type: "FLAT",
  amount: "",
  freeShippingThreshold: "",
  isActive: true,
};

export default function AdminShippingPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(emptyRule);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRules = useCallback(async (p) => {
    try {
      const data = await getShippingRules({ page: p, limit: PAGE_SIZE });
      const items = Array.isArray(data) ? data : data.items || data.rules || [];
      setRules(items);
      setTotalPages(data.totalPages || Math.max(1, Math.ceil((data.total || items.length) / PAGE_SIZE)));
      setTotal(data.total || items.length);
    } catch {
      setMessage({ type: "error", text: "Failed to load shipping rules" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules(page);
  }, [page, fetchRules]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingRule(null);
    setForm(emptyRule);
    setShowModal(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name || "",
      type: rule.type || "FLAT",
      amount: rule.amount?.toString() || "",
      freeShippingThreshold: rule.freeShippingThreshold?.toString() || "",
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setForm(emptyRule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const payload = {
      ...form,
      amount: parseFloat(form.amount) || 0,
      freeShippingThreshold: form.freeShippingThreshold
        ? parseFloat(form.freeShippingThreshold)
        : null,
    };

    try {
      if (editingRule) {
        await updateShippingRule(editingRule.id, payload);
        setMessage({ type: "success", text: "Rule updated" });
        closeModal();
        fetchRules(page);
      } else {
        await createShippingRule(payload);
        setMessage({ type: "success", text: "Rule added" });
        closeModal();
        fetchRules(page);
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteShippingRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Rule deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const formatAmount = (rule) => {
    if (rule.type === "FREE") return "PKR 0";
    return `PKR ${(rule.amount || 0).toLocaleString("en-PK")}`;
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Shipping Rules</h1>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shipping Rules</h1>
        <Button onClick={openAddModal}>Add New Rule</Button>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {rules.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No shipping rules yet</p>
          <Button className="mt-4" onClick={openAddModal}>
            Add First Rule
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Free Threshold</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{rule.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            rule.type === "FLAT"
                              ? "bg-blue-100 text-blue-800"
                              : rule.type === "WEIGHT"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatAmount(rule)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {rule.freeShippingThreshold
                          ? `PKR ${rule.freeShippingThreshold.toLocaleString("en-PK")}`
                          : "None"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            rule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(rule)}
                            className="p-1.5 text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {deleteConfirm === rule.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(rule.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(rule.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingRule ? "Edit Rule" : "Add Rule"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Rule Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Standard Shipping"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {SHIPPING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount (PKR)"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="200"
                required
              />

              <Input
                label="Free Shipping Threshold (PKR)"
                type="number"
                name="freeShippingThreshold"
                value={form.freeShippingThreshold}
                onChange={handleChange}
                placeholder="5000"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Orders above this amount get free shipping
              </p>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingRule ? "Update" : "Add Rule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
