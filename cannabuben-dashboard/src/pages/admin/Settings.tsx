import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface SettingsData {
  version: string;
  maintenance: boolean;
  environment: string;
  spinCooldown: string;
  premiumSpinCooldown: string;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load settings");
        setSettings(json.settings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-page">
      <h2>⚙️ System Settings</h2>
      <ul>
        <li>Version: {settings?.version}</li>
        <li>Environment: {settings?.environment}</li>
        <li>Maintenance: {settings?.maintenance ? "🛠️ On" : "✅ Off"}</li>
        <li>Spin Cooldown: {settings?.spinCooldown}</li>
        <li>Premium Spin Cooldown: {settings?.premiumSpinCooldown}</li>
      </ul>
    </div>
  );
};

export default AdminSettings;
