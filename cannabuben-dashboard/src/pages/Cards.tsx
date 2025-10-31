import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";
import { apiGet } from "../lib/api";
import { getEmail, isLoggedIn } from "../lib/auth";
import logo from "../assets/logo.png";
import coinIcon from "../assets/logo-icon.png";

// ✅ card fronts
import card1 from "../assets/card-front-1.png";
import card2 from "../assets/card-front-2.png";
import card3 from "../assets/card-front-3.png";
import card4 from "../assets/card-front-4.png";
import card5 from "../assets/card-front-5.png";
import card6 from "../assets/card-front-6.png";
import card7 from "../assets/card-front-7.png";
import card8 from "../assets/card-front-8.png";
import card9 from "../assets/card-front-9.png";
import card10 from "../assets/card-front-10.png";
import card11 from "../assets/card-front-11.png";
import card12 from "../assets/card-front-12.png";
import card13 from "../assets/card-front-13.png";
import card14 from "../assets/card-front-14.png";
import card15 from "../assets/card-front-15.png";
import card16 from "../assets/card-front-16.png";
import card17 from "../assets/card-front-17.png";
import card18 from "../assets/card-front-18.png";
import card19 from "../assets/card-front-19.png";
import card20 from "../assets/card-front-20.png";
import card21 from "../assets/card-front-21.png";
import card22 from "../assets/card-front-22.png";
import card23 from "../assets/card-front-23.png";
import card24 from "../assets/card-front-24.png";
import card25 from "../assets/card-front-25.png";
import card26 from "../assets/card-front-26.png";
import card27 from "../assets/card-front-27.png";
import card28 from "../assets/card-front-28.png";
import card29 from "../assets/card-front-29.png";
import card30 from "../assets/card-front-30.png";
import card31 from "../assets/card-front-31.png";
import card32 from "../assets/card-front-32.png";
import card33 from "../assets/card-front-33.png";

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

        const r = await fetch(
          `https://cannabuben-backend-fkxi.onrender.com/api/cards?email=${encodeURIComponent(email)}`
        );
        const j = await r.json();
        if (r.ok && j?.success) setCards(j.cards || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [email]);

function getCardThumb(c: any, i: number): string {
  if (c?.image) return c.image;
  const id = c.cardId ?? i + 1;
  const CARD_IMAGES: Record<number, string> = {
    1: card1, 2: card2, 3: card3, 4: card4, 5: card5, 6: card6, 7: card7, 8: card8, 9: card9,
    10: card10, 11: card11, 12: card12, 13: card13, 14: card14, 15: card15, 16: card16, 17: card17,
    18: card18, 19: card19, 20: card20, 21: card21, 22: card22, 23: card23, 24: card24, 25: card25,
    26: card26, 27: card27, 28: card28, 29: card29, 30: card30, 31: card31, 32: card32, 33: card33
  };
  return CARD_IMAGES[id] || card1; // fallback to first card if ID is missing
}


  return (
    <main className="grovi-main">
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
                <img src={getCardThumb(c, i)} alt={c.name || "Card"} />
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
