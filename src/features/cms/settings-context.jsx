"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext({
  storeName: "WEJ Shoes",
  logoUrl: "",
  supportEmail: "",
  phone: "",
  whatsappNumber: "",
  currency: "PKR",
  codEnabled: true,
  isLoading: true,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    storeName: "WEJ Shoes",
    logoUrl: "",
    supportEmail: "",
    phone: "",
    whatsappNumber: "",
    currency: "PKR",
    codEnabled: true,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            storeName: data.storeName || "WEJ Shoes",
            logoUrl: data.logoUrl || "",
            supportEmail: data.supportEmail || "",
            phone: data.phone || "",
            whatsappNumber: data.whatsappNumber || "",
            currency: data.currency || "PKR",
            codEnabled: data.codEnabled ?? true,
            isLoading: false,
          });
        } else {
          setSettings((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setSettings((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
