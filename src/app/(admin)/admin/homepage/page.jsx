"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const SECTION_TYPES = [
  { value: "HERO", label: "Hero Banner" },
  { value: "BANNER", label: "Promo Banner" },
  { value: "CATEGORY_HIGHLIGHT", label: "Category Highlight" },
  { value: "FEATURE", label: "Feature Section" },
  { value: "PROMO", label: "Promo Section" },
];

const emptyBlock = {
  sectionType: "HERO",
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "",
  buttonUrl: "",
  isActive: true,
};

export default function AdminHomepagePage() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [form, setForm] = useState(emptyBlock);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchBlocks();
  }, []);

  async function fetchBlocks() {
    try {
      const res = await fetch("/api/admin/homepage");
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load homepage content" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingBlock(null);
    setForm(emptyBlock);
    setShowModal(true);
  };

  const openEditModal = (block) => {
    setEditingBlock(block);
    setForm({
      sectionType: block.sectionType,
      title: block.title || "",
      subtitle: block.subtitle || "",
      imageUrl: block.imageUrl || "",
      buttonText: block.buttonText || "",
      buttonUrl: block.buttonUrl || "",
      isActive: block.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBlock(null);
    setForm(emptyBlock);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (editingBlock) {
        const res = await fetch(`/api/admin/homepage/${editingBlock.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (res.ok) {
          setMessage({ type: "success", text: "Block updated" });
          closeModal();
          fetchBlocks();
        } else {
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Failed to update" });
        }
      } else {
        const res = await fetch("/api/admin/homepage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (res.ok) {
          setMessage({ type: "success", text: "Block added" });
          closeModal();
          fetchBlocks();
        } else {
          const data = await res.json();
          setMessage({ type: "error", text: data.error || "Failed to add" });
        }
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/homepage/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlocks((prev) => prev.filter((b) => b.id !== id));
        setDeleteConfirm(null);
        setMessage({ type: "success", text: "Block deleted" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const handleMove = async (index, direction) => {
    const newBlocks = [...blocks];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[swapIndex];
    newBlocks[swapIndex] = temp;

    const order = newBlocks.map((b) => b.id);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", order }),
      });

      if (res.ok) {
        setBlocks(newBlocks);
      } else {
        fetchBlocks();
      }
    } catch {
      fetchBlocks();
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Homepage Content</h1>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Homepage Content</h1>
        <Button onClick={openAddModal}>Add New Block</Button>
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

      {blocks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No homepage content yet</p>
          <Button className="mt-4" onClick={openAddModal}>
            Add First Block
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="bg-white rounded-lg border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {block.sectionType}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      block.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {block.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-400">#{block.sortOrder}</span>
                </div>
                <p className="font-medium text-gray-900 truncate">
                  {block.title || "Untitled"}
                </p>
                {block.subtitle && (
                  <p className="text-sm text-gray-500 truncate">{block.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => openEditModal(block)}
                  className="p-1.5 text-gray-400 hover:text-blue-600"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {deleteConfirm === block.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(block.id)}
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
                    onClick={() => setDeleteConfirm(block.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingBlock ? "Edit Block" : "Add Block"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Section Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="sectionType"
                  value={form.sectionType}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {SECTION_TYPES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Summer Sale"
              />

              <Input
                label="Subtitle"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="Up to 50% off"
              />

              <Input
                label="Image URL"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Button Text"
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  placeholder="Shop Now"
                />
                <Input
                  label="Button URL"
                  name="buttonUrl"
                  value={form.buttonUrl}
                  onChange={handleChange}
                  placeholder="/collections/sale"
                />
              </div>

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
                  {editingBlock ? "Update" : "Add Block"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
