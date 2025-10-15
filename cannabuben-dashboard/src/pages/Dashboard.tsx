import React, { useState, useRef } from "react";
import "../styles/dashboard.css";
import DailySpin from "../components/DailySpin";
import CollectCard from "../components/CollectCard";

const Dashboard: React.FC = () => {
  const [email, setEmail] = useState("");
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myCards, setMyCards] = useState<Array<{ name?: string; image?: string }>>([]);

  const spinRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  const fetchCoins = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setCoins(data.coins ?? 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCoinsUpdate = (newCoins: number) => setCoins(newCoins);
  const handleCardCollected = (card: { name?: string; image?: string }) => {
    setMyCards((s) => [card, ...s].slice(0, 24));
  };

  const scrollTo = (which: "spin" | "cards") => {
    if (which === "spin" && spinRef.current)
      spinRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    if (which === "cards" && cardsRef.current)
      cardsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="cb-root">
      <aside className="cb-sidebar">
        <div className="cb-brand">
          <div className="cb-leaf" />
          <div className="cb-title">CannaBuben</div>
        </div>
        <nav className="cb-nav">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Dashboard</button>
          <button onClick={() => scrollTo("spin")}>Spin</button>
          <button onClick={() => scrollTo("cards")}>Cards</button>
          <button>Profile</button>
        </nav>
      </aside>

      <main className="cb-main">
        <header className="cb-header">
          <h1>Welcome Back🌿</h1>
          <p>Earn coins with purchases and spend them on games and rewards.</p>
        </header>

        <section className="cb-top-row">
          {/* 🌿 New wrapper to group My Points + Check Coins together */}
          <div className="cb-points-section">
            <div className="cb-points-card">
              <div className="cb-points-icon" />
              <div>
                <div className="cb-points-title">My Points</div>
                <div className="cb-points-value">{coins ?? "—"}</div>
                <div className="cb-points-sub">
                  Enter the email used at checkout to load your account.
                </div>
              </div>
            </div>

            <div className="card card-check">
              <h3>Check Your Coins</h3>
              <div className="check-row">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="email"
                />
                <button onClick={fetchCoins} disabled={loading}>
                  {loading ? "Checking..." : "Check"}
                </button>
              </div>
              {error && <div className="cb-error">{error}</div>}
            </div>
          </div>

          <div className="cb-play-box">
            <div className="cb-play-header">Play & Win</div>
            <div className="cb-play-actions">
              <div className="cb-action">
                <img
                  src="/src/assets/wheel.png"
                  alt="spin preview"
                  className="cb-action-img"
                />
                <div className="cb-action-title">Spin the Wheel</div>
                <button className="cb-action-btn" onClick={() => scrollTo("spin")}>
                  Play Spin
                </button>
              </div>

              <div className="cb-action">
                <img
                  src="/src/assets/card-front-1.png"
                  alt="card preview"
                  className="cb-action-img"
                />
                <div className="cb-action-title">Open Card Pack</div>
                <button className="cb-action-btn" onClick={() => scrollTo("cards")}>
                  Open Pack
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="cb-games-grid">
          <div className="cb-left">
            <div className="card card-games">
              <div ref={spinRef} id="spin" className="game-col">
                <h3 className="game-title">🎯 Spin the Wheel</h3>
                <DailySpin email={email} onCoinsUpdated={handleCoinsUpdate} />
              </div>

              <div ref={cardsRef} id="cards" className="game-col">
                <h3 className="game-title">🃏 Card Pack</h3>
                <CollectCard
                  email={email}
                  onCoinsUpdated={handleCoinsUpdate}
                  onCollected={handleCardCollected}
                />
              </div>
            </div>
          </div>

          <aside className="cb-achievements card">
            <h3>My Cards</h3>
            <div className="cards-row">
              {myCards.length === 0 && (
                <div className="muted">No cards collected yet</div>
              )}
              {myCards.map((c, i) => (
                <div className="card-thumb" key={i}>
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  ) : (
                    <div>{c.name}</div>
                  )}
                </div>
              ))}
            </div>

            <h4 style={{ marginTop: 12 }}>Achievements</h4>
            <ul>
              <li>💎 5 Spins Completed</li>
              <li>🔥 10 Cards Collected</li>
              <li>🌿 First Purchase Bonus</li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
