import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getEmail, isLoggedIn, clearSession } from "../lib/auth";
import "../styles/dashboard.css";
import logo from "../assets/logo.png";
import coinIcon from "../assets/logo-icon.png";

const Profile: React.FC = () => {
  const nav = useNavigate();
  const [email] = useState(getEmail() || "");
  const [name, setName] = useState("");
  const [coins, setCoins] = useState<number | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!isLoggedIn()) {
        nav("/login");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://cannabuben-backend-fkxi.onrender.com/api/user?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (res.ok) {
          setCoins(json.coins ?? 0);
          setName(json.name || "");
          setAvatar(json.avatar || null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [email, nav]);

  const handleSave = async () => {
    if (!name.trim()) return alert("Name cannot be empty");
    setSaving(true);
    try {
      const res = await fetch("https://cannabuben-backend-fkxi.onrender.com/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const logout = () => {
    clearSession();
    nav("/login", { replace: true });
  };

  return (
    <main className="grovi-main">
      {/* TOP NAV (same as Games page) */}
      <div className="grovi-topnav">
        <div className="grovi-top-logo">
          <img src={logo} alt="CannaBuben" />
        </div>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Dashboard
        </NavLink>
        <NavLink to="/games" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Games
        </NavLink>
        <NavLink to="/cards" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Cards
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Profile
        </NavLink>
        <NavLink to="/Rewards" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Rewards
        </NavLink>

        <div className="grovi-coin-pill">
          <img src={coinIcon} alt="Coins" />
          <span>{coins ?? "—"}</span>
        </div>
      </div>

      {/* PAGE CONTENT (same layout spacing as Games page) */}
      <div style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0, color: "#2E5632" }}>My Profile</h2>
        <p className="muted">Update your display name and avatar below.</p>

        <div className="panel" style={{ maxWidth: 480, marginTop: 20 }}>
          <div className="panel-inner" style={{ textAlign: "center" }}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: "#f4e8c3",
                      margin: "0 auto 12px",
                      overflow: "hidden",
                      border: "2px solid #dbaf3e",
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: 40, lineHeight: "100px" }}>👤</span>
                    )}
                  </div>

                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </div>

                <label className="muted small">Email (read-only)</label>
                <input
                  type="text"
                  value={email}
                  disabled
                  style={{ width: "100%", marginBottom: 12 }}
                />

                <label className="muted small">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name"
                  style={{ width: "100%", marginBottom: 12 }}
                />

                <label className="muted small">Coins</label>
                <input
                  type="text"
                  value={coins ?? "—"}
                  disabled
                  style={{ width: "100%", marginBottom: 12 }}
                />

                <button
                  className="cb-action-btn"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ width: "100%", borderRadius: 10 }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  className="grovi-logout"
                  onClick={logout}
                  style={{ width: "100%", marginTop: 20 }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
