import axios from "axios";

// Load token from localStorage
function getAdminToken() {
  try {
    return localStorage.getItem("adminToken") || "";
  } catch {
    return "";
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token for admin routes
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
