// In local dev, .env sets VITE_API_URL to http://localhost:4000/api.
// In production (single-service deploy), no env var is set, so this
// falls back to a relative "/api" — meaning it calls whatever domain
// served the site, since the backend serves the built frontend too.
const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `Upload failed (${res.status})`);
  }
  return data; // { url }
}

export const api = {
  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  // menu
  getMenu: () => request("/menu"),
  createMenuItem: (payload, token) => request("/menu", { method: "POST", body: payload, token }),
  updateMenuItem: (id, payload, token) => request(`/menu/${id}`, { method: "PUT", body: payload, token }),
  deleteMenuItem: (id, token) => request(`/menu/${id}`, { method: "DELETE", token }),

  // orders
  placeOrder: (payload, token) => request("/orders", { method: "POST", body: payload, token }),
  getMyOrders: (token) => request("/orders/mine", { token }),
  getOrder: (id, token) => request(`/orders/${id}`, { token }),
  getAllOrders: (token) => request("/orders", { token }),
  updateOrderStatus: (id, status, token) =>
    request(`/orders/${id}/status`, { method: "PATCH", body: { status }, token }),

  // uploads
  uploadImage,
};

// Turns a relative "/uploads/xyz.jpg" path from our own backend into a full URL.
// External URLs (e.g. https://images.unsplash.com/...) are returned unchanged.
export function resolveImageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}${url}`;
}
