import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

interface KPIData {
  totalUsers: number;
  activeUsers: number;
  totalCoins: number;
  spinsUsed: number;
  boxesOpened: number;
  topCards: { _id: string; pulls: number }[];
  latestTx: any[];
  range: number;
}

const COLORS = ["#2E5632", "#4CAF50", "#A3D977", "#81C784", "#C8E6C9"];

const AdminOverview: React.FC = () => {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState(30); // default 30 days

  async function fetchData(selectedRange: number) {
    try {
      setLoading(true);
      setError("");
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/api/admin/kpis?range=${selectedRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(range); }, [range]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-page">
      <h2>📊 Overview Dashboard</h2>

      {/* 🔘 Date Range Toggle */}
      <div style={{ marginBottom: 20 }}>
        <button
          className={`range-btn ${range === 7 ? "active" : ""}`}
          onClick={() => setRange(7)}>Last 7 Days</button>
        <button
          className={`range-btn ${range === 30 ? "active" : ""}`}
          onClick={() => setRange(30)}>Last 30 Days</button>
        <button
          className={`range-btn ${range === 0 ? "active" : ""}`}
          onClick={() => setRange(0)}>All Time</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
        <div className="stat-card">👥 Total Users: {data?.totalUsers}</div>
        <div className="stat-card">🔥 Active Users: {data?.activeUsers}</div>
        <div className="stat-card">💰 Total Coins: {data?.totalCoins}</div>
        <div className="stat-card">🎡 Spins Used: {data?.spinsUsed}</div>
        <div className="stat-card">🎁 Boxes Opened: {data?.boxesOpened}</div>
      </div>

      {/* === Charts Section === */}
      <div className="charts-container" style={{ display: "grid", gap: "24px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
          <h4>🏅 Top 5 Cards</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data?.topCards} dataKey="pulls" nameKey="_id" outerRadius={100} label>
                {data?.topCards.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
          <h4>🕒 Last 10 Transactions</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.latestTx.map((tx) => ({
              name: tx.meta?.source || "Other",
              coins: tx.coins,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="coins" fill="#2E5632" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
          <h4>📅 Engagement Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { name: "Users", value: data?.totalUsers },
                { name: "Active", value: data?.activeUsers },
                { name: "Spins", value: data?.spinsUsed },
                { name: "Boxes", value: data?.boxesOpened },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2E5632" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
