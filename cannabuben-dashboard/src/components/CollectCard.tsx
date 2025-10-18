import React, { useState } from "react";

// ✅ Local image imports – scalable to many cards later
import card1 from "../assets/card-front-1.png";
import card2 from "../assets/card-front-2.png";
import card3 from "../assets/card-front-3.png";
import card4 from "../assets/card-front-4.png";
import card5 from "../assets/card-front-5.png";
import cardBack from "../assets/card-back.png";

interface CollectCardProps {
  email: string;
  onCoinsUpdated?: (coins: number) => void;
  onCollected?: (card: { name?: string; image?: string }) => void;
}

// Map cardId -> image. You can extend this list up to 40+ by importing
// card-front-6.png, card-front-7.png, ... and pushing them here.
const CARD_IMAGES: Record<number, string> = {
  1: card1,
  2: card2,
  3: card3,
  4: card4,
  5: card5,
};

const CollectCard: React.FC<CollectCardProps> = ({ email, onCoinsUpdated, onCollected }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [card, setCard] = useState<{ name?: string; image?: string; coins?: number } | null>(null);

  function resolveImage(cardId?: number) {
    if (!cardId) return cardBack;
    return CARD_IMAGES[cardId] || cardBack;
  }

  const handleCollect = async () => {
    if (!email) {
      setMessage("Please sign in or enter your email first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setCard(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cards/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Something went wrong");
      }

      // ✅ Backend returns { card: { id, name, rarity, coins }, totalCoins }
      const img = resolveImage(data.card?.id);
      const collectedCard = {
        name: data.card?.name,
        image: img,
        coins: data.card?.coins,
      };

      setCard(collectedCard);
      setMessage(`You pulled ${data.card?.name}! (+${data.card?.coins} coins)`);

      if (onCoinsUpdated) onCoinsUpdated(data.totalCoins);
      if (onCollected) onCollected(collectedCard);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Failed to collect card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collect-card-container">
      <button
        onClick={handleCollect}
        disabled={loading || !email}
        className="cb-action-btn"
        style={{
          width: "100%",
          marginBottom: 12,
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.06)",
          background: loading || !email ? "#d7c79a" : "#DBAF3E",
          color: "#1E1E1E",
          fontWeight: 800,
          cursor: loading || !email ? "not-allowed" : "pointer",
          transition: "all .2s ease",
        }}
        onMouseOver={(e) => {
          if (loading || !email) return;
          (e.target as HTMLButtonElement).style.background = "#2E5632";
          (e.target as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseOut={(e) => {
          if (loading || !email) return;
          (e.target as HTMLButtonElement).style.background = "#DBAF3E";
          (e.target as HTMLButtonElement).style.color = "#1E1E1E";
        }}
        title={!email ? "Sign in first to open a pack" : "Open a card pack"}
      >
        {loading ? "Opening Pack..." : "Open Pack"}
      </button>

      {message && (
        <div style={{ marginBottom: 10, color: "#2E5632", fontWeight: 600 }}>{message}</div>
      )}

      {card && (
        <div className="card-result" style={{ textAlign: "center" }}>
          <img
            src={card.image}
            alt={card.name}
            style={{
              width: "180px",
              borderRadius: 12,
              boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
            }}
          />
          <div style={{ marginTop: 8, fontWeight: 700 }}>{card.name}</div>
          <div style={{ color: "#DBAF3E", fontWeight: 600 }}>+{card.coins} coins</div>
        </div>
      )}
    </div>
  );
};

export default CollectCard;
