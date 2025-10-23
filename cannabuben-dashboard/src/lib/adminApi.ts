export const ADMIN_API = import.meta.env.VITE_API_URL + "/api/admin";

export async function adminGet(path: string, token: string) {
  const res = await fetch(`${ADMIN_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function adminPost(path: string, token: string, data: any) {
  const res = await fetch(`${ADMIN_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDelete(path: string, token: string) {
  const res = await fetch(`${ADMIN_API}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
