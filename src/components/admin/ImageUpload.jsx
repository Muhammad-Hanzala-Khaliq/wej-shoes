"use client";

import { useState, useRef } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({ value = "", onChange, folder = "uploads" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, WebP, and GIF are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    setError("");
    onChange("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Image (optional)
      </label>

      {value ? (
        <div className="relative w-full max-w-xs border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <img
            src={value}
            alt="Category image"
            className="w-full h-40 object-cover"
          />
          <div className="flex items-center justify-between p-2 bg-white border-t border-gray-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Change"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full max-w-xs border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isUploading
              ? "border-gray-300 bg-gray-50 cursor-wait"
              : "border-gray-300 hover:border-gray-400 cursor-pointer"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400 mx-auto mb-1"
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
              <p className="text-sm text-gray-600">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPG, PNG, WebP, GIF up to 5MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
