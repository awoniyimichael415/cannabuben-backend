import React, { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { getAdminToken } from "../../lib/adminAuth";

interface SettingsData {
  version: string;
  maintenance: boolean;
  environment: string;
  spinCooldown: string;
  premiumSpinCooldown: string;
  coinBurnRate?: number;
  rewardMultiplier?: number;
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchSettings() {
    try {
      setLoading(true);
      setError("");
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

  async function saveSettings() {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save settings");
      alert("✅ Settings updated successfully!");
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!settings) return <p>No settings found.</p>;

  return (
    <div className="admin-page">
      <h2>⚙️ System Settings</h2>
      <p style={{ color: "#444" }}>
        Manage Grovi platform configuration and maintenance options.
      </p>

      <div
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: 500,
          marginTop: 16,
        }}
      >
        <label>
          Version:
          <input
            type="text"
            value={settings.version}
            onChange={(e) => setSettings({ ...settings, version: e.target.value })}
            style={inputStyle}
          />
        </label>

        <label>
          Environment:
          <select
            value={settings.environment}
            onChange={(e) => setSettings({ ...settings, environment: e.target.value })}
            style={inputStyle}
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </label>

        <label>
          Spin Cooldown:
          <input
            type="text"
            value={settings.spinCooldown}
            onChange={(e) => setSettings({ ...settings, spinCooldown: e.target.value })}
            style={inputStyle}
          />
        </label>

        <label>
          Premium Spin Cooldown:
          <input
            type="text"
            value={settings.premiumSpinCooldown}
            onChange={(e) =>
              setSettings({ ...settings, premiumSpinCooldown: e.target.value })
            }
            style={inputStyle}
          />
        </label>

        <label>
          Coin Burn Rate (%):
          <input
            type="number"
            value={settings.coinBurnRate ?? 0}
            onChange={(e) =>
              setSettings({ ...settings, coinBurnRate: Number(e.target.value) })
            }
            style={inputStyle}
          />
        </label>

        <label>
          Reward Multiplier:
          <input
            type="number"
            value={settings.rewardMultiplier ?? 1}
            onChange={(e) =>
              setSettings({ ...settings, rewardMultiplier: Number(e.target.value) })
            }
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.maintenance}
            onChange={(e) =>
              setSettings({ ...settings, maintenance: e.target.checked })
            }
          />
          Maintenance Mode ({settings.maintenance ? "🛠️ On" : "✅ Off"})
        </label>

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            background: "#2E5632",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            marginTop: 10,
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : "💾 Save Settings"}
        </button>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: 6,
  marginTop: 4,
};

export default AdminSettings;
