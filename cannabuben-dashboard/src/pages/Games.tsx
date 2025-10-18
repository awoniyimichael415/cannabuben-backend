import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";
import DailySpin from "../components/DailySpin";
import CollectCard from "../components/CollectCard";
import { apiGet } from "../lib/api";
import { getEmail, isLoggedIn } from "../lib/auth";
import logo from "../assets/logo.png";
import coinIcon from "../assets/logo-icon.png";

const Games: React.FC = () => {
  const email = getEmail() || "";
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    async function loadCoins() {
      try {
        let currentCoins: number | null = null;
        if (isLoggedIn()) {
          const res = await apiGet("/api/auth/me");
          const json = await res.json();
          if (res.ok && json?.success) currentCoins = json.user?.coins ?? 0;
        }
        setCoins(currentCoins ?? 0);
      } catch (e) {
        console.error(e);
      }
    }
    loadCoins();
  }, []);

  return (
    <main className="grovi-main">
      {/* TOP NAV (same as Dashboard) */}
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

        <div className="grovi-coin-pill">
          <img src={coinIcon} alt="Coins" />
          <span>{coins ?? "—"}</span>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0, color: "#2E5632" }}>Games</h2>
        <p className="muted">Play the games below to win coins and collect cards.</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            maxWidth: 1100,
          }}
        >
          <section className="panel">
            <div className="panel-inner">
              <h3 className="panel-title">🎯 Spin the Wheel</h3>
              <DailySpin email={email} onCoinsUpdated={() => {}} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-inner">
              <h3 className="panel-title">🃏 Card Pack Opening</h3>
              <CollectCard
                email={email}
                onCoinsUpdated={() => {}}
                onCollected={() => {}}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Games;
