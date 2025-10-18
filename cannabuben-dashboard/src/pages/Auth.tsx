import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../lib/api";
import { setSession } from "../lib/auth";
import "../styles/dashboard.css"; // reuse your styles

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
        <div className="cb-brand" style={{ marginBottom: 12 }}>
          <div className="cb-leaf" />
          <div className="cb-title">CannaBuben</div>
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

        {err && <div className="cb-error" style={{ marginTop: 8 }}>{err}</div>}

        <button className="cb-action-btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: 10 }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
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
          <Link to="/" className="link-btn">Back to Dashboard</Link>
        </div>
      </form>
    </div>
  );
};

export default Auth;
