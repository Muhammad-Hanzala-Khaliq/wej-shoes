const STORAGE_KEY = "wej_recently_viewed";

export function addRecentlyViewed(item) {
  if (typeof window === "undefined") return;

  try {
    const current = getRecentlyViewed();

    const normalizedSlug = String(item.slug || "").toLowerCase().trim();
    if (!normalizedSlug) return;

    const filtered = current.filter((entry) => {
      const entrySlug = String(entry.slug || "").toLowerCase().trim();
      return entrySlug !== normalizedSlug;
    });

    const newItem = {
      slug: normalizedSlug,
      name: item.name,
      imageUrl: item.imageUrl,
      regularPrice: Number(item.regularPrice) || 0,
      salePrice: item.salePrice ? Number(item.salePrice) : null,
      viewedAt: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, 8);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Recently viewed save failed:", err);
  }
}

export function getRecentlyViewed() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const items = JSON.parse(raw);

    const seen = new Set();
    const deduped = items.filter((item) => {
      const slug = String(item.slug || "").toLowerCase().trim();
      if (!slug || seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });

    deduped.sort((a, b) => (b.viewedAt || 0) - (a.viewedAt || 0));

    return deduped;
  } catch (err) {
    console.error("Recently viewed read failed:", err);
    return [];
  }
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Clear failed:", err);
  }
}
