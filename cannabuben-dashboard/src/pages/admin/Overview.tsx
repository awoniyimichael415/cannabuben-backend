import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface KPIData {
  totalUsers: number;
  activeUsers: number;
  totalCoins: number;
  spinsUsed: number;
  boxesOpened: number;
  coinsIssued: number;
  coinsBurned: number;
  topCards: { _id: string; count: number }[];
  latestTx: {
    _id?: string;
    coins: number;
    meta?: { source?: string };
    createdAt?: string;
    userId?: { email?: string };
  }[];
}

const COLORS = ["#2E5632", "#4CAF50", "#A3D977", "#81C784", "#C8E6C9"];

const AdminOverview: React.FC = () => {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState<number>(7); // default: last 7 days

  async function fetchData(selectedRange = range) {
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
      console.error(err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(range);
  }, [range]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>No data</p>;

  const txChartData = (data.latestTx || []).map((tx) => ({
    name: tx.meta?.source || "other",
    coins: tx.coins || 0,
  }));

  const lineChartData = [
    { name: "Users", value: data.totalUsers || 0 },
    { name: "Spins", value: data.spinsUsed || 0 },
    { name: "Boxes", value: data.boxesOpened || 0 },
    { name: "Coins", value: data.totalCoins || 0 },
  ];

  const topCardsData =
    data.topCards?.length > 0
      ? data.topCards.map((c) => ({ _id: c._id, pulls: c.count }))
      : [
          { _id: "Gold Rush", pulls: 24 },
          { _id: "Purple Dream", pulls: 20 },
          { _id: "Leaf Wizard", pulls: 11 },
          { _id: "Chilltoad", pulls: 8 },
          { _id: "Grovi Spirit", pulls: 4 },
        ];

  return (
    <div className="admin-page">
      <h2>📊 Overview Dashboard</h2>

      {/* 🔘 Date Range Toggle */}
      <div style={{ marginBottom: 20 }}>
        <button
          className={`range-btn ${range === 7 ? "active" : ""}`}
          onClick={() => setRange(7)}
          style={rangeBtn(range === 7)}
        >
          Last 7 Days
        </button>
        <button
          className={`range-btn ${range === 30 ? "active" : ""}`}
          onClick={() => setRange(30)}
          style={rangeBtn(range === 30)}
        >
          Last 30 Days
        </button>
        <button
          className={`range-btn ${range === 0 ? "active" : ""}`}
          onClick={() => setRange(0)}
          style={rangeBtn(range === 0)}
        >
          All Time
        </button>
      </div>

      {/* KPI Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: "16px",
          margin: "16px 0",
        }}
      >
        <div className="stat-card" style={cardStyle}>
          👥 Total Users:
          <div style={bigStat}>{data.totalUsers ?? 0}</div>
        </div>

        <div className="stat-card" style={cardStyle}>
          🟢 Active Users:
          <div style={bigStat}>{data.activeUsers ?? 0}</div>
        </div>

        <div className="stat-card" style={cardStyle}>
          💰 Total Coins:
          <div style={bigStat}>{data.totalCoins ?? 0}</div>
        </div>

        <div className="stat-card" style={cardStyle}>
          🎡 Spins Used:
          <div style={bigStat}>{data.spinsUsed ?? 0}</div>
        </div>

        <div className="stat-card" style={cardStyle}>
          🎁 Boxes Opened:
          <div style={bigStat}>{data.boxesOpened ?? 0}</div>
        </div>

        <div className="stat-card" style={cardStyle}>
          🪙 Coins Issued:
          <div style={bigStat}>{data.coinsIssued ?? 0}</div>
        </div>

        <div className="stat-card" style={cardStyle}>
          🔥 Coins Burned:
          <div style={bigStat}>{data.coinsBurned ?? 0}</div>
        </div>
      </div>

      {/* === Charts Section === */}
      <div
        className="charts-container"
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        }}
      >
        {/* Top Cards Pie */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>🏅 Top 5 Cards</h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={topCardsData}
                dataKey="pulls"
                nameKey="_id"
                outerRadius={90}
                label
              >
                {topCardsData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Last 10 Transactions Bar */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>🕒 Last 10 Transactions</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={txChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="coins" fill="#2E5632" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Trend Line */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>📅 Engagement Trend</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2E5632"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// style helpers
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: "16px",
  fontSize: 14,
  lineHeight: 1.4,
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
  color: "#2E5632",
  fontWeight: 500,
};

const bigStat: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  marginTop: 4,
  color: "#1E1E1E",
};

const panelStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
};

const panelTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  color: "#2E5632",
  fontWeight: 600,
  fontSize: 15,
};

const rangeBtn = (active: boolean): React.CSSProperties => ({
  border: "1px solid #2E5632",
  borderRadius: 6,
  background: active ? "#2E5632" : "#fff",
  color: active ? "#fff" : "#2E5632",
  padding: "6px 10px",
  marginRight: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  transition: "all 0.2s ease",
});

export default AdminOverview;
