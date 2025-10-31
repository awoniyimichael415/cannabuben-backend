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
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface AnalyticsData {
  signups: { _id: string; count: number }[];
  coinsIssued: number;
  coinsBurned: number;
  spinsUsed: number;
  boxesOpened: number;
  topRewards: { title: string; priceCoins: number; stock: number }[];
  topCards: { _id: string; count: number }[];
}

const COLORS = ["#2E5632", "#4CAF50", "#A3D977", "#81C784", "#C8E6C9"];

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");
        const token = getAdminToken();
        const res = await fetch(`${API_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load analytics");
        setData(json.analytics);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>No analytics available</p>;

  // derived totals
  const totalCoinsNet = data.coinsIssued - data.coinsBurned;
  const coinsChart = [
    { name: "Issued", value: data.coinsIssued },
    { name: "Burned", value: data.coinsBurned },
  ];

  return (
    <div className="admin-page">
      <h2>📊 Analytics Dashboard</h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Live overview of Grovi user activity, coin flow, and engagement performance.
      </p>

      {/* === KPI CARDS === */}
      <div
        className="grid"
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          👥 Total Signups:
          <div style={bigStat}>
            {data.signups.reduce((a, b) => a + b.count, 0)}
          </div>
        </div>
        <div style={cardStyle}>
          🎡 Spins Used:
          <div style={bigStat}>{data.spinsUsed}</div>
        </div>
        <div style={cardStyle}>
          🎁 Boxes Opened:
          <div style={bigStat}>{data.boxesOpened}</div>
        </div>
        <div style={cardStyle}>
          💰 Coins (Net):
          <div style={bigStat}>{totalCoinsNet}</div>
        </div>
      </div>

      {/* === CHARTS === */}
      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        }}
      >
        {/* 🧩 Daily Signups */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>📅 Daily Signups (last 7 days)</h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.signups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2E5632"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 💰 Coin Flow Pie */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>💰 Coin Flow</h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={coinsChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {coinsChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 🏅 Top Rewards */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>🏅 Top 5 Rewards</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topRewards}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="priceCoins" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🃏 Top Cards */}
        <div style={panelStyle}>
          <h4 style={panelTitle}>🃏 Most Pulled Cards</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topCards}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2E5632" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// === Reusable styles ===
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: "16px",
  fontSize: 14,
  lineHeight: 1.4,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
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
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};
const panelTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  color: "#2E5632",
  fontWeight: 600,
  fontSize: 15,
};

export default AdminAnalytics;
