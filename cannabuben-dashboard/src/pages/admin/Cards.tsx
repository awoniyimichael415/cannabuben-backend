import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface Card {
  _id?: string;
  name: string;
  rarity: string;
  coinsEarned: number;
  imageUrl?: string;
  productId?: number;
  active?: boolean;
  createdAt?: string;
}

const AdminCards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [form, setForm] = useState<Partial<Card>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = getAdminToken();

  async function loadCards() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/cards`, {
        headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => { loadCards(); }, []);

  async function uploadImage(file: File): Promise<string> {
    const data = new FormData();
    data.append("image", file);
    const res = await fetch(`${API_URL}/api/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Upload failed");
    return json.url;
  }

  async function saveCard(e: React.FormEvent) {
    e.preventDefault();
    try {
      let imgUrl = form.imageUrl || "";
      if ((form as any).file instanceof File) {
        imgUrl = await uploadImage((form as any).file);
      }
      const payload = { ...form, imageUrl: imgUrl };
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/api/admin/cards/${editingId}`
        : `${API_URL}/api/admin/cards`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      setForm({});
      setEditingId(null);
      loadCards();
      alert("✅ Card saved successfully!");
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  async function deleteCard(id: string) {
    if (!confirm("Delete this card?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/cards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Delete failed");
      loadCards();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  return (
    <div className="admin-page">
      <h2>🃏 Strain Card Management</h2>

      <form onSubmit={saveCard} style={{ marginBottom: 24 }}>
        <h4>{editingId ? "✏️ Edit Card" : "➕ Add New Strain Card"}</h4>

        <input
          placeholder="Card Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="Rarity (Common, Rare, Epic, Legendary)"
          value={form.rarity || ""}
          onChange={(e) => setForm({ ...form, rarity: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Coin Value"
          value={form.coinsEarned || ""}
          onChange={(e) =>
            setForm({ ...form, coinsEarned: Number(e.target.value) })
          }
          required
        />

        {/* NEW FIELD: WooCommerce product ID */}
        <input
          type="number"
          placeholder="WooCommerce Product ID"
          value={form.productId || ""}
          onChange={(e) =>
            setForm({ ...form, productId: Number(e.target.value) })
          }
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, file: e.target.files?.[0] })}
        />

        <label style={{ marginLeft: 10 }}>
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{" "}
          Active
        </label>

        <div style={{ marginTop: 10 }}>
          <button type="submit">
            {editingId ? "💾 Update Card" : "✅ Add Card"}
          </button>
          {editingId && (
            <button type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p>Loading cards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && cards.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rarity</th>
              <th>Coins</th>
              <th>Product ID</th>
              <th>Image</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.rarity}</td>
                <td>{c.coinsEarned}</td>
                <td>{c.productId || "—"}</td>
                <td>
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      style={{ width: 40, height: 40, borderRadius: 6 }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>{c.active ? "✅" : "❌"}</td>
                <td>
                  <button onClick={() => { setForm(c); setEditingId(c._id!); }}>✏️</button>
                  <button onClick={() => deleteCard(c._id!)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCards;
