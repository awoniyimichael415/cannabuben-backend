import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAdminToken } from "../../lib/adminAuth";
import { API_URL } from "../../lib/api";
import logo from "../../assets/logo.png"; // ✅ Import logo

const AdminLogin: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.error || "Login failed");
        return;
      }
      setAdminToken(json.token);
      nav("/admin", { replace: true });
    } catch (e: any) {
      setErr(e.message || "Network error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#FAF6EC",
        padding: "env(safe-area-inset-top) 16px env(safe-area-inset-bottom)",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: 360,
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* ✅ Brand Logo */}
        <div style={{ marginBottom: 12 }}>
          <img
            src={logo}
            alt="CannaBuben Logo"
            style={{ width: 140, height: "auto", marginBottom: 8 }}
          />
        </div>

        <h2 style={{ marginBottom: 8, color: "#2E5632" }}>Admin Sign in</h2>
        <p style={{ marginTop: 0, color: "#666" }}>
          Enter your administrator credentials.
        </p>

        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
            margin: "6px 0 12px",
          }}
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPwd(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
            margin: "6px 0 16px",
          }}
        />
        {err && (
          <div style={{ color: "#b91c1c", marginBottom: 10 }}>{err}</div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#2E5632",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
