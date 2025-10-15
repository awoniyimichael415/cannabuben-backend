import { useEffect, useState } from "react";

interface Card {
  _id: string;
  name: string;
  rarity: string;
  imageUrl: string;
}

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchCards() {
    setLoading(true);
    try {
      const email = localStorage.getItem("userEmail");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/cards?email=${encodeURIComponent(email || "")}`);
      if (!res.ok) throw new Error("Failed to load cards");
      const data = await res.json();
      setCards(data.cards || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h2>My Cards</h2>
      {loading && <p>Loading cards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}>
        {cards.map((card) => (
          <div
            key={card._id}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
              width: 180,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <img
              src={card.imageUrl}
              alt={card.name}
              style={{ width: "100%", borderRadius: 8 }}
            />
            <h4 style={{ margin: "10px 0 5px" }}>{card.name}</h4>
            <p style={{ color: "gray", fontSize: 14 }}>{card.rarity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
