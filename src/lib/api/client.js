export async function apiFetch(url, { method = "GET", body, throwOnError = true, ...opts } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    cache: "no-store",
    ...opts,
  });

  let data = null;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok && throwOnError) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}
