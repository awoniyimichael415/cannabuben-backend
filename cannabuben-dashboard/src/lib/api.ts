import { getToken } from "./auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Reusable GET helper
export async function apiGet(path: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
}

// 🔹 Reusable POST helper
export async function apiPost(path: string, body: any = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res;
}
