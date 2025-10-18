import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";
import { apiGet } from "../lib/api";
import { getEmail, isLoggedIn } from "../lib/auth";
import logo from "../assets/logo.png";
import coinIcon from "../assets/logo-icon.png";
import cardBack from "../assets/card-back.png";

const Cards: React.FC = () => {
  const email = getEmail() || "";
  const [cards, setCards] = useState<any[]>([]);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        let currentCoins: number | null = null;
        if (isLoggedIn()) {
          const res = await apiGet("/api/auth/me");
          const json = await res.json();
          if (res.ok && json?.success) currentCoins = json.user?.coins ?? 0;
        }
        setCoins(currentCoins ?? 0);

        const r = await fetch(`http://localhost:5000/api/cards?email=${encodeURIComponent(email)}`);
        const j = await r.json();
        if (r.ok && j?.success) setCards(j.cards || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [email]);

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
        <h2 style={{ marginTop: 0, color: "#2E5632" }}>My Cards Collection</h2>
        <p className="muted">Here are all your collected strain cards.</p>

        <div
          className="cards-grid"
          style={{
            marginTop: 20,
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {cards.length === 0 && (
            <p className="muted">You haven’t collected any cards yet.</p>
          )}

          {cards.map((c, i) => (
            <div key={c.id || i} className="card-thumb">
              <div className="thumb-imgwrap">
                <img src={c.image || cardBack} alt={c.name || "Card"} />
              </div>
              <div className="thumb-caption">
                <div className="thumb-title">{c.name || "Strain Card"}</div>
                {c.rarity && (
                  <div className={`pill small rarity-${(c.rarity || "").toLowerCase()}`}>
                    {c.rarity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Cards;
