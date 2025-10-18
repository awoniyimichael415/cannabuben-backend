// src/lib/api.ts
import { getToken } from "./auth";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken() || ""}` },
  });
  return res;
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken() || ""}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}
