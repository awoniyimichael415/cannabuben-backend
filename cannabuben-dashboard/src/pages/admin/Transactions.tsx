import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface TxItem {
  id: string;
  email: string;
  name?: string;
  coins: number;
  orderId?: string;
  type: string;
  date: string;
}

const AdminTransactions: React.FC = () => {
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTx() {
      try {
        const token = getAdminToken();
        const res = await fetch(`${API_URL}/api/admin/transactions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load");
        setTxs(json.txs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTx();
  }, []);

  return (
    <div className="admin-page">
      <h2>💰 Transactions</h2>
      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Coins</th>
              <th>Type</th>
              <th>Order ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td>{t.name || "—"}</td>
                <td>{t.email}</td>
                <td>{t.coins}</td>
                <td>{t.type}</td>
                <td>{t.orderId || "—"}</td>
                <td>{new Date(t.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTransactions;
