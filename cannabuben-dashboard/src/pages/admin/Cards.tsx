import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface AdminCard {
  id: string;
  user: string;
  name: string;
  rarity: string;
  coinsEarned: number;
  createdAt: string;
}

const AdminCards: React.FC = () => {
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch(`${API_URL}/api/admin/cards`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load cards");
        setCards(json.cards || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  return (
    <div className="admin-page">
      <h2>🃏 Collected Cards</h2>
      {loading && <p>Loading cards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Card</th>
              <th>Rarity</th>
              <th>Coins</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td>{c.user}</td>
                <td>{c.name}</td>
                <td>{c.rarity}</td>
                <td>{c.coinsEarned}</td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCards;
