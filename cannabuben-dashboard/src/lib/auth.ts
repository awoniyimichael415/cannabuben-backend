const TOKEN_KEY = "cb_token";
const EMAIL_KEY = "cb_email";

// 🔐 Save token + email
export function setSession(token: string, email: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

// 🧹 Clear session
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

// 🔑 Get stored values
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

// ✅ Convenience check
export function isLoggedIn(): boolean {
  return !!getToken();
}
