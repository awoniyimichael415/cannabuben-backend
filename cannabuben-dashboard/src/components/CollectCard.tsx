import React, { useState } from "react";

interface CollectCardProps {
  email: string;
  onCoinsUpdated?: (coins: number) => void;
  onCollected?: (card: { name?: string; image?: string }) => void;
}

const CollectCard: React.FC<CollectCardProps> = ({ email, onCoinsUpdated, onCollected }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [card, setCard] = useState<{ name?: string; image?: string; coins?: number } | null>(null);

  const handleCollect = async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setCard(null);

    try {
      const res = await fetch("http://localhost:5000/api/cards/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      // ✅ Backend now returns card.id and image
      const collectedCard = {
        name: data.card.name,
        image: data.card.image || `/src/assets/card-front-${data.card.id}.png`,
        coins: data.card.coins,
      };

      setCard(collectedCard);
      setMessage(`You pulled ${data.card.name}! (+${data.card.coins} coins)`);

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
        disabled={loading}
        className="cb-action-btn"
        style={{ width: "100%", marginBottom: 12 }}
      >
        {loading ? "Opening Pack..." : "Open Pack"}
      </button>

      {message && <div style={{ marginBottom: 10, color: "#2E5632", fontWeight: 600 }}>{message}</div>}

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
