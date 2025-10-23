import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface Reward {
  _id: string;
  title: string;
  description: string;
  cost: number;
  stock: number;
  limitPerUser: number;
  active: boolean;
}

const AdminRewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Reward>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = getAdminToken();

  async function loadRewards() {
    try {
      const res = await fetch(`${API_URL}/api/admin/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      setRewards(json.rewards || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRewards(); }, []);

  async function saveReward(e: React.FormEvent) {
    e.preventDefault();
    try {
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
      setForm({});
      setEditingId(null);
      loadRewards();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteReward(id: string) {
    if (!confirm("Delete this reward?")) return;
    try {
      await fetch(`${API_URL}/api/admin/rewards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadRewards();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="admin-page">
      <h2>🏆 Rewards</h2>

      <form onSubmit={saveReward} style={{ marginBottom: 20 }}>
        <h4>{editingId ? "Edit Reward" : "Add New Reward"}</h4>
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
          placeholder="Cost"
          value={form.cost || ""}
          onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock || ""}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && <button onClick={() => setEditingId(null)}>Cancel</button>}
      </form>

      {loading && <p>Loading rewards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Limit/User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r._id}>
                <td>{r.title}</td>
                <td>{r.cost}</td>
                <td>{r.stock}</td>
                <td>{r.limitPerUser}</td>
                <td>
                  <button onClick={() => { setForm(r); setEditingId(r._id); }}>✏️</button>
                  <button onClick={() => deleteReward(r._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminRewards;
