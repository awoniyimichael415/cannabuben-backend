import React, { useState } from "react";
import { setSession } from "../lib/auth";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.error || "Auth failed");
        return;
      }
      setSession(json.token, json.user?.email || email);
      nav("/"); // go to dashboard
    } catch (e: any) {
      setErr(e.message || "Network error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FAF6EC" }}>
      <form onSubmit={submit} style={{ width: 360, background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.08)" }}>
        <h2 style={{ marginBottom: 8, color: "#2E5632" }}>{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p style={{ marginTop: 0, color: "#666" }}>
          Use the same email you used to order (WooCommerce).
        </p>
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "6px 0 12px" }}
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPwd(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "6px 0 16px" }}
        />
        {err && <div style={{ color: "#b91c1c", marginBottom: 10 }}>{err}</div>}
        <button type="submit" style={{ width: "100%", padding: 12, background: "#DBAF3E", color: "#1E1E1E", border: "none", borderRadius: 8, fontWeight: 700 }}>
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          {mode === "login" ? (
            <span>
              No password yet?{" "}
              <button type="button" onClick={() => setMode("register")} style={{ background: "transparent", border: "none", color: "#2E5632", fontWeight: 700, cursor: "pointer" }}>
                Create account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} style={{ background: "transparent", border: "none", color: "#2E5632", fontWeight: 700, cursor: "pointer" }}>
                Sign in
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
