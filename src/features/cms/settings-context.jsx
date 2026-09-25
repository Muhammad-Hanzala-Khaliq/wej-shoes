"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSettings } from "@/lib/api/settings";

const SettingsContext = createContext({
  storeName: "HADAIRE FOOTWEAR",
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
    storeName: "HADAIRE FOOTWEAR",
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
        const data = await getSettings();
        setSettings({
          storeName: data.storeName || "HADAIRE FOOTWEAR",
          logoUrl: data.logoUrl || "",
          supportEmail: data.supportEmail || "",
          phone: data.phone || "",
          whatsappNumber: data.whatsappNumber || "",
          currency: data.currency || "PKR",
          codEnabled: data.codEnabled ?? true,
          isLoading: false,
        });
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
