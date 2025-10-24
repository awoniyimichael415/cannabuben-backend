import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { apiGet } from "../lib/api";
import { clearSession, getEmail, isLoggedIn } from "../lib/auth";

// Assets
import logo from "../assets/logo.png";
import coinIcon from "../assets/logo-icon.png";
import spinWheel from "../assets/spin-wheel.png";
import cardFront from "../assets/card-front.png";

// Local card images
import card1 from "../assets/card-front-1.png";
import card2 from "../assets/card-front-2.png";
import card3 from "../assets/card-front-3.png";
import card4 from "../assets/card-front-4.png";
import card5 from "../assets/card-front-5.png";
import cardBack from "../assets/card-back.png";

type CardItem = {
  id?: string;
  name?: string;
  rarity?: string;
  coinsEarned?: number;
  image?: string | null;
  createdAt?: string;
  cardId?: number;
};

const Dashboard: React.FC = () => {
  const nav = useNavigate();
  const [email] = useState<string>(getEmail() || "");
  const [coins, setCoins] = useState<number | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function getCardThumb(c: CardItem, i: number): string {
    if (c?.image) return c.image;
    const id = c.cardId ?? i + 1;
    switch (id) {
      case 1: return card1;
      case 2: return card2;
      case 3: return card3;
      case 4: return card4;
      case 5: return card5;
      default: return cardBack;
    }
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");

        let currentCoins: number | null = null;
        if (isLoggedIn()) {
          const res = await apiGet("/api/auth/me");
          const json = await res.json();
          if (res.ok && json?.success) currentCoins = json.user?.coins ?? 0;
        }
        if (currentCoins === null && email) {
          const r = await fetch(`https://cannabuben-backend-fkxi.onrender.com/api/user?email=${encodeURIComponent(email)}`);
          const j = await r.json();
          currentCoins = j.coins ?? 0;
        }
        setCoins(currentCoins ?? 0);

        if (email) {
          const cr = await fetch(`https://cannabuben-backend-fkxi.onrender.com/api/cards?email=${encodeURIComponent(email)}`);
          const cj = await cr.json();
          if (cr.ok && cj?.success) setCards(cj.cards || []);
        }
      } catch (e: any) {
        console.error(e);
        setErr(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [email]);

  const recentSix = useMemo(() => (cards || []).slice(0, 6), [cards]);

  const logout = () => {
    clearSession();
    nav("/login", { replace: true });
  };

  return (
    <div className="grovi-root">
      {/* LEFT SIDEBAR */}
      <aside className="grovi-sidebar">
        <nav className="grovi-sidenav">
          <NavLink to="/" end className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}>
            <span className="icon">🏠</span> Dashboard
          </NavLink>
          <NavLink to="/games" className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}>
            <span className="icon">🎮</span> Games
          </NavLink>
          <NavLink to="/cards" className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}>
            <span className="icon">🃏</span> Cards
          </NavLink>
          {/* ✅ New Profile link */}
          <NavLink to="/profile" className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}>
            <span className="icon">👤</span> Profile
          </NavLink>
        </nav>

        <div className="grovi-sidebar-bottom">
          <div className="grovi-balance">
            <span className="avatar">👤</span>
            <span className="pill">{coins ?? "—"}</span>
          </div>
          <button className="grovi-logout" onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="grovi-main">
        {/* TOP NAV WITH LOGO */}
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
          {/* ✅ Added Profile link to top bar */}
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
            Profile
          </NavLink>

          <div className="grovi-coin-pill">
            <img src={coinIcon} alt="Coins" />
            <span>{coins ?? "—"}</span>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grovi-grid">
          {/* My Points */}
          <section className="panel mypoints">
            <div className="panel-inner">
              <div className="coin-hero">
                <img src={coinIcon} alt="Coin" />
              </div>
              <h3 className="panel-title">My Points</h3>
              <div className="points-big">{loading ? "…" : coins ?? "—"}</div>
              <p className="muted center">
                Earn points with your purchases and redeem them for rewards.
              </p>
            </div>
          </section>

          {/* Play & Win */}
          <section className="panel playwin">
            <div className="panel-inner">
              <h3 className="panel-title">Play &amp; Win</h3>

              <div className="play-tiles">
                <div className="play-tile">
                  <div className="tile-icon-img">
                    <img src={spinWheel} alt="Spin Wheel" />
                  </div>
                  <div className="tile-title">Spin the Wheel</div>
                  <Link to="/games" className="tile-btn">Try Your Luck!</Link>
                </div>

                <div className="play-tile">
                  <div className="tile-icon-img">
                    <img src={cardFront} alt="Card Pack" />
                  </div>
                  <div className="tile-title">Card Pack Opening</div>
                  <Link to="/games" className="tile-btn">Open a Pack!</Link>
                </div>
              </div>
            </div>
          </section>

          {/* My Cards */}
          <section className="panel mycards">
            <div className="panel-inner">
              <h3 className="panel-title">My Cards</h3>

              <div className="cards-grid">
                {recentSix.length === 0 && (
                  <div className="muted" style={{ gridColumn: "1/-1" }}>
                    No cards yet. Play in <Link to="/games">Games</Link> to collect some!
                  </div>
                )}
                {recentSix.map((c, i) => (
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

              <p className="muted small">
                These are your most recent 6 strain cards. View all cards on the{" "}
                <Link to="/cards">Cards page</Link>.
              </p>
            </div>
          </section>
        </div>

        {err && <div className="cb-error" style={{ marginTop: 16 }}>{err}</div>}
      </main>
    </div>
  );
};

export default Dashboard;
