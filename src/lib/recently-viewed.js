const STORAGE_KEY = "wej_recently_viewed";

export function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((i) => i.slug !== item.slug);
    const updated = [{ ...item }, ...filtered].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
