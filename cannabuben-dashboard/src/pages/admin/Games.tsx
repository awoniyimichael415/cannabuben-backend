import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface GameConfig {
  spin: Record<string, string>;
  box: Record<string, string>;
}

const AdminGames: React.FC = () => {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`${API_URL}/api/admin/games`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load game config");
        setConfig(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  if (loading) return <p>Loading game configuration...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-page">
      <h2>🎮 Game Configuration</h2>
      <section className="panel">
        <h3>🎡 Spin the Wheel</h3>
        <table className="admin-table">
          <tbody>
            {Object.entries(config?.spin || {}).map(([key, val]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h3>🎁 Mystery Box</h3>
        <table className="admin-table">
          <tbody>
            {Object.entries(config?.box || {}).map(([key, val]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminGames;
