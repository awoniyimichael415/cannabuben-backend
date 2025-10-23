import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface AnalyticsData {
  users: number;
  cards: number;
  retention: string;
  dailySpins: number;
  topReward: string;
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
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

  return (
    <div className="admin-page">
      <h2>📈 Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card">👥 Users: {data?.users}</div>
        <div className="stat-card">🃏 Cards: {data?.cards}</div>
        <div className="stat-card">📊 Retention: {data?.retention}</div>
        <div className="stat-card">🎡 Daily Spins: {data?.dailySpins}</div>
        <div className="stat-card">🏆 Top Reward: {data?.topReward}</div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
