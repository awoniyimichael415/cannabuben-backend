import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { apiGet, apiPost } from "../lib/api";

// 🖼️ 33 card images
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

interface CollectCardProps {
  email: string;
  onCoinsUpdated?: (coins: number) => void;
  onCollected?: (card: { name?: string; rarity?: string; image?: string }) => void;
}

// 🧩 Map card names to images
const CARD_IMAGES: Record<string, string> = {
  "Mini Leaf Coin": card1,
  "Green Stack": card2,
  "Boost Drop": card3,
  "Sun Sprout": card4,
  "Leafy Charm": card5,
  "Coin Sprig": card6,
  "Happy Bud": card7,
  "Bloom Token": card8,
  "Seed Starter": card9,
  "Lucky Clover": card10,
  "Small Glow": card11,
  "Fresh Mint": card12,
  "Green Essence": card13,
  "Coin Sprout": card14,
  "Herb Spark": card15,
  "Leaf Drop": card16,
  "Tiny Bloom": card17,
  "Mini Shroom": card18,
  "Little Stone": card19,
  "Herbal Dust": card20,

  "Coin Storm": card21,
  "Energy Boost": card22,
  "Spin Token": card23,
  "Grovi Gem": card24,
  "Power Leaf": card25,
  "Glow Dust": card26,
  "Root Crystal": card27,
  "Chroma Vine": card28,

  "Leaf Wizard": card29,
  "Chilltoad": card30,
  "Time Sprout": card31,

  "Grovi Spirit": card32,
  "Golden Guardian": card33,
};

const CollectCard: React.FC<CollectCardProps> = ({ email, onCoinsUpdated, onCollected }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [card, setCard] = useState<{ name?: string; rarity?: string; image?: string } | null>(null);
  const [boxes, setBoxes] = useState<number>(0);

  // 🎁 Load user boxes count
  async function fetchBoxes() {
    if (!email) return;
    try {
      const res = await apiGet(`/api/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (typeof data.boxes === "number") setBoxes(data.boxes);
    } catch (err) {
      console.error("Box load error:", err);
    }
  }

  useEffect(() => {
    fetchBoxes();
  }, [email]);

  const handleOpenBox = async () => {
    if (!email) {
      setMessage("Please log in first.");
      return;
    }

    await fetchBoxes();
    if (boxes <= 0) {
      setMessage("No boxes available. Redeem a Mystery Box in Rewards!");
      return;
    }

    setLoading(true);
    setMessage("");
    setCard(null);

    try {
      const res = await apiPost("/api/box/open", { email });
      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "No boxes available.");
        setLoading(false);
        return;
      }

      const name = data.card?.name || "Mystery Card";
      const rarity = data.card?.rarity || "Common";
      const image = CARD_IMAGES[name] || card1; // fallback to first card if missing

      const resultCard = { name, rarity, image };
      setCard(resultCard);
      setBoxes(data.boxesLeft ?? 0);
      setMessage(`🎉 You pulled a ${rarity} card: ${name}! (+${data.rewardCoins} coins)`);

      if (onCollected) onCollected(resultCard);
      if (onCoinsUpdated && typeof data.remainingCoins === "number") {
        onCoinsUpdated(data.remainingCoins);
      }
    } catch (err) {
      console.error("Open box error:", err);
      setMessage("Server error while opening box.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collect-card-container">
      <button
        onClick={handleOpenBox}
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
      >
        {loading ? "Opening Box..." : "Open Mystery Box"}
      </button>

      <div style={{ marginBottom: 10, fontSize: "14px", color: "#2E5632" }}>
        {boxes > 0
          ? `🎁 You have ${boxes} Mystery Box${boxes > 1 ? "es" : ""} available`
          : "No boxes available"}
      </div>

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
          <div
            style={{
              color:
                card.rarity === "Legendary"
                  ? "#d4af37"
                  : card.rarity === "Epic"
                  ? "#7B68EE"
                  : card.rarity === "Rare"
                  ? "#2E5632"
                  : "#888",
              fontWeight: 600,
            }}
          >
            {card.rarity}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectCard;
