import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface Reward {
  _id: string;
  title: string;
  description?: string;
  priceCoins: number;
  stock: number;
  limitPerUser: number;
  featured?: boolean;
  active: boolean;
  type?: string;
}

const AdminRewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Reward>>({
    title: "",
    priceCoins: 0,
    stock: 0,
    limitPerUser: 1,
    type: "coupon",
    featured: false,
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = getAdminToken();

  /** 🔹 Load all rewards */
  async function loadRewards() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/admin/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load rewards");
      setRewards(json.rewards || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  /** 🔹 Create or update reward */
  async function saveReward(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!form.title || !form.priceCoins)
        throw new Error("Title and price are required");

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/api/admin/rewards/${editingId}`
        : `${API_URL}/api/admin/rewards`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");

      setForm({
        title: "",
        description: "",
        priceCoins: 0,
        stock: 0,
        limitPerUser: 1,
        type: "coupon",
        featured: false,
        active: true,
      });
      setEditingId(null);
      await loadRewards();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  /** 🔹 Delete reward */
  async function deleteReward(id: string) {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/rewards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete");
      loadRewards();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  }

  return (
    <div className="admin-page">
      <h2>🏆 Rewards Management</h2>
      <p style={{ color: "#444", marginBottom: 16 }}>
        Manage user rewards, coupons, and NFT drops.
      </p>

      {/* Form Section */}
      <form
        onSubmit={saveReward}
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          marginBottom: 20,
        }}
      >
        <h4>{editingId ? "✏️ Edit Reward" : "➕ Add New Reward"}</h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
          }}
        >
          <input
            placeholder="Title"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price (Coins)"
            value={form.priceCoins || ""}
            onChange={(e) =>
              setForm({ ...form, priceCoins: Number(e.target.value) })
            }
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock || ""}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Limit per User"
            value={form.limitPerUser || ""}
            onChange={(e) =>
              setForm({ ...form, limitPerUser: Number(e.target.value) })
            }
          />
          <select
            value={form.type || "coupon"}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="coupon">Coupon</option>
            <option value="mysteryBox">Mystery Box</option>
            <option value="spinTicket">Spin Ticket</option>
            <option value="item">Item</option>
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <label style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={form.featured || false}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
            />{" "}
            Featured
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            Active
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            type="submit"
            style={{
              background: "#2E5632",
              color: "#fff",
              padding: "6px 14px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {editingId ? "💾 Update Reward" : "✅ Add Reward"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  priceCoins: 0,
                  stock: 0,
                  limitPerUser: 1,
                  type: "coupon",
                  featured: false,
                  active: true,
                });
              }}
              style={{
                marginLeft: 10,
                padding: "6px 14px",
                borderRadius: 6,
                background: "#ccc",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table Section */}
      {loading && <p>Loading rewards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && rewards.length > 0 && (
        <table
          className="admin-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th>Title</th>
              <th>Type</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Limit/User</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r._id}>
                <td>{r.title}</td>
                <td>{r.type || "coupon"}</td>
                <td>{r.priceCoins}</td>
                <td>{r.stock}</td>
                <td>{r.limitPerUser}</td>
                <td>{r.active ? "✅" : "❌"}</td>
                <td>
                  <button
                    onClick={() => {
                      setForm(r);
                      setEditingId(r._id);
                    }}
                    style={{
                      background: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 8px",
                      marginRight: 6,
                      cursor: "pointer",
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteReward(r._id)}
                    style={{
                      background: "#E53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && rewards.length === 0 && (
        <p style={{ textAlign: "center", marginTop: 20 }}>
          No rewards found. Add one above!
        </p>
      )}
    </div>
  );
};

export default AdminRewards;
