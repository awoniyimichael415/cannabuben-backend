import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface TxItem {
  _id: string;
  userEmail: string;
  coins: number;
  orderId?: string;
  meta?: {
    source?: string;
    reward?: string;
    boxGranted?: boolean;
    cardsAwarded?: string[];
  };
  createdAt: string;
}

const AdminTransactions: React.FC = () => {
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "earn" | "spend">("all");
  const [search, setSearch] = useState("");

  /** 🔹 Load transactions */
  async function loadTx() {
    try {
      setLoading(true);
      setError("");
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/api/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load transactions");

      const mapped = (json.txs || []).map((t: any) => ({
        _id: t._id,
        userEmail: t.userId?.email || "—",
        coins: t.coins,
        orderId: t.orderId,
        meta: t.meta || {},
        createdAt: t.createdAt,
      }));
      setTxs(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTx();
  }, []);

  /** 🔹 Filtered Data */
  const filteredTxs = txs
    .filter((t) => {
      if (filter === "earn") return t.coins > 0;
      if (filter === "spend") return t.coins < 0;
      return true;
    })
    .filter((t) =>
      t.userEmail.toLowerCase().includes(search.toLowerCase())
    );

  /** 🔹 Derived Metrics */
  const totalEarned = txs.filter((t) => t.coins > 0).reduce((a, b) => a + b.coins, 0);
  const totalSpent = txs.filter((t) => t.coins < 0).reduce((a, b) => a + b.coins, 0);

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-page">
      <h2>💳 Transactions Log</h2>
      <p style={{ color: "#555", marginBottom: 10 }}>
        Track user coin flow across spins, boxes, rewards, and other events.
      </p>

      {/* === Filters and Search === */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <div>
          <strong>Filter: </strong>
          {["all", "earn", "spend"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              style={{
                margin: "0 4px",
                padding: "4px 8px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: filter === type ? "#2E5632" : "#ddd",
                color: filter === type ? "#fff" : "#000",
              }}
            >
              {type === "earn" ? "Earnings" : type === "spend" ? "Spendings" : "All"}
            </button>
          ))}
        </div>

        <input
          placeholder="🔍 Search user email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: "6px 8px",
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />
      </div>

      {/* === Summary Stats === */}
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div style={statCard}>Total Earned: <span style={{ color: "green" }}>+{totalEarned}</span></div>
        <div style={statCard}>Total Spent: <span style={{ color: "red" }}>{totalSpent}</span></div>
        <div style={statCard}>Total Records: {txs.length}</div>
      </div>

      {/* === Table === */}
      {filteredTxs.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Coins</th>
              <th>Source</th>
              <th>Reward</th>
              <th>Cards</th>
              <th>Order ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map((t) => (
              <tr key={t._id}>
                <td>{t.userEmail}</td>
                <td style={{ color: t.coins >= 0 ? "green" : "red", fontWeight: 600 }}>
                  {t.coins}
                </td>
                <td>{t.meta?.source || "—"}</td>
                <td>{t.meta?.reward || (t.meta?.boxGranted ? "Mystery Box" : "—")}</td>
                <td>{t.meta?.cardsAwarded ? t.meta.cardsAwarded.join(", ") : "—"}</td>
                <td>{t.orderId || "—"}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No matching transactions found.</p>
      )}
    </div>
  );
};

const statCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: "10px 16px",
  boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  color: "#2E5632",
  fontWeight: 500,
  fontSize: 14,
};

export default AdminTransactions;
