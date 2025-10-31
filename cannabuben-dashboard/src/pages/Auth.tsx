import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../lib/api";
import { setSession } from "../lib/auth";
import "../styles/dashboard.css"; // reuse your styles
import logo from "../assets/logo.png"; // ✅ your real logo

const Auth: React.FC = () => {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErr(json.error || "Authentication failed");
        return;
      }
      setSession(json.token, json.user?.email || email);
      nav("/", { replace: true }); // go to dashboard
    } catch (e: any) {
      setErr(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        {/* ✅ Replace text with logo */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={logo}
            alt="CannaBuben Logo"
            style={{
              width: 140,
              height: "auto",
              marginBottom: 6,
            }}
          />
        </div>

        <h2 style={{ margin: 0 }}>
          {mode === "login" ? "Sign in" : "Create account"}
        </h2>
        <p className="muted" style={{ marginTop: 6 }}>
          Use the same email you used at checkout (WooCommerce).
        </p>

        <label className="auth-label">Email</label>
        <input
          className="auth-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label className="auth-label">Password</label>
        <input
          className="auth-input"
          type="password"
          required
          value={password}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="••••••••"
        />

        {err && (
          <div className="cb-error" style={{ marginTop: 8 }}>
            {err}
          </div>
        )}

        {/* ✅ Styled Sign In / Register button (same as AdminLogin style) */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#2E5632",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
            marginTop: 12,
          }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          {mode === "login" ? (
            <span className="muted">
              No password yet?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="link-btn"
              >
                Create account
              </button>
            </span>
          ) : (
            <span className="muted">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="link-btn"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link to="/" className="link-btn">
            Back to Dashboard
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Auth;
