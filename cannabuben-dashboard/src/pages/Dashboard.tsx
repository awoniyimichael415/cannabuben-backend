import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { apiGet, API_URL } from "../lib/api"; // ✅ import API_URL
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
    const CARD_IMAGES: Record<number, string> = {
      1: card1, 2: card2, 3: card3, 4: card4, 5: card5, 6: card6, 7: card7, 8: card8, 9: card9,
      10: card10, 11: card11, 12: card12, 13: card13, 14: card14, 15: card15, 16: card16, 17: card17,
      18: card18, 19: card19, 20: card20, 21: card21, 22: card22, 23: card23, 24: card24, 25: card25,
      26: card26, 27: card27, 28: card28, 29: card29, 30: card30, 31: card31, 32: card32, 33: card33
    };
    return CARD_IMAGES[id] || cardBack;
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
          // ✅ Fetch user details using environment API_URL
          const r = await fetch(`${API_URL}/api/user?email=${encodeURIComponent(email)}`);
          const j = await r.json();
          currentCoins = j.coins ?? 0;
        }
        setCoins(currentCoins ?? 0);

        if (email) {
          // ✅ Fetch user cards using environment API_URL
          const cr = await fetch(`${API_URL}/api/box?email=${encodeURIComponent(email)}`);
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
          <NavLink to="/profile" className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}>
            <span className="icon">👤</span> Profile
          </NavLink>
          <NavLink to="/Rewards" className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}>
            <span className="icon">🎁</span> Rewards
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