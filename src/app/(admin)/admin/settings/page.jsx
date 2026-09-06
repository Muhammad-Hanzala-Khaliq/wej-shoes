"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "",
    logoUrl: "",
    supportEmail: "",
    phone: "",
    whatsappNumber: "",
    currency: "PKR",
    codEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            storeName: data.storeName || "",
            logoUrl: data.logoUrl || "",
            supportEmail: data.supportEmail || "",
            phone: data.phone || "",
            whatsappNumber: data.whatsappNumber || "",
            currency: data.currency || "PKR",
            codEnabled: data.codEnabled ?? true,
          });
        }
      } catch {
        setMessage({ type: "error", text: "Failed to load settings" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>

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

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-6">
          {/* General */}
          <div>
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store Name"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                placeholder="WEJ Shoes"
                required
              />
              <Input
                label="Logo URL"
                name="logoUrl"
                value={settings.logoUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Support Email"
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                placeholder="support@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="03XXXXXXXXX"
              />
              <Input
                label="WhatsApp Number"
                type="tel"
                name="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={handleChange}
                placeholder="923XXXXXXXXX"
              />
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  disabled
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                >
                  <option value="PKR">PKR (Pakistani Rupee)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Only PKR supported for now</p>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="codEnabled"
                    checked={settings.codEnabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  Cash on Delivery (COD) Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
