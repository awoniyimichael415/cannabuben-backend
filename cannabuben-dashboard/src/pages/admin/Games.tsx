import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { apiGet, apiPost } from "../../lib/api";
import "../../styles/dashboard.css"; // ✅ Import shared dashboard styles
import logo from "../../assets/logo.png";

interface SpinReward {
  label: string;
  type: "coins" | "mystery_box" | "extra_spin" | "nothing";
  value: number;
  weight: number;
}

interface SpinConfig {
  rewards: SpinReward[];
  freeCooldownHours: number;
  premiumCooldownHours: number;
  version: number;
}

interface BoxPool {
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  weight: number;
}

interface BoxConfig {
  pools: BoxPool[];
  packSize: number;
  version: number;
}

export default function AdminGames() {
  const [loading, setLoading] = useState(true);
  const [spin, setSpin] = useState<SpinConfig>({
    rewards: [],
    freeCooldownHours: 24,
    premiumCooldownHours: 6,
    version: 1,
  });
  const [box, setBox] = useState<BoxConfig>({
    pools: [],
    packSize: 1,
    version: 1,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/games");
      const data = await res.json();
      if (data.success) {
        setSpin(data.data.spin || spin);
        setBox(data.data.box || box);
      } else toast.error("Failed to load game config");
    } catch (err) {
      console.error(err);
      toast.error("Error loading config");
    }
    setLoading(false);
  }

  async function saveConfig(publish = false) {
    try {
      const res = await apiPost("/api/admin/games", {
        spin,
        box,
        publish,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(publish ? "Config published!" : "Draft saved!");
        loadConfig();
      } else toast.error(data.error || "Save failed");
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  }

  function updateReward(i: number, field: keyof SpinReward, value: any) {
    setSpin((prev) => {
      const rewards = Array.isArray(prev.rewards) ? [...prev.rewards] : [];
      rewards[i] = { ...rewards[i], [field]: value };
      return { ...prev, rewards };
    });
  }

  function updatePool(i: number, field: keyof BoxPool, value: any) {
    setBox((prev) => {
      const pools = Array.isArray(prev.pools) ? [...prev.pools] : [];
      pools[i] = { ...pools[i], [field]: value };
      return { ...prev, pools };
    });
  }

  if (loading) return <p className="p-6">Loading game configuration...</p>;

  return (
    <main className="grovi-main">
      {/* Top Nav like other admin pages */}
      <div className="grovi-topnav">
        <div className="grovi-top-logo">
          <img src={logo} alt="CannaBuben" />
        </div>
        <h2 className="toplink active">🎮 Admin Game Config</h2>
      </div>

      <div style={{ padding: 24 }}>
        <h2 style={{ color: "#2E5632", marginBottom: 4 }}>Game Configuration</h2>
        <p className="muted" style={{ marginBottom: 24 }}>
          Manage spin wheel rewards, box drop rates, and cooldowns.
        </p>

        {/* SPIN CONFIG */}
        <section className="panel">
          <div className="panel-inner">
            <h3 className="panel-title">🎯 Spin the Wheel</h3>
            <p className="muted small">Define the rewards available from the wheel.</p>

            {Array.isArray(spin?.rewards) && spin.rewards.length > 0 ? (
              spin.rewards.map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-2 border p-3 rounded-lg mb-2"
                >
                  <input
                    value={r.label}
                    onChange={(e) => updateReward(i, "label", e.target.value)}
                    placeholder="Label"
                    className="input"
                  />
                  <select
                    value={r.type}
                    onChange={(e) =>
                      updateReward(i, "type", e.target.value as SpinReward["type"])
                    }
                    className="input"
                  >
                    <option value="coins">Coins</option>
                    <option value="mystery_box">Mystery Box</option>
                    <option value="extra_spin">Extra Spin</option>
                    <option value="nothing">Nothing</option>
                  </select>
                  <input
                    type="number"
                    value={r.value}
                    onChange={(e) =>
                      updateReward(i, "value", Number(e.target.value))
                    }
                    placeholder="Value"
                    className="input"
                  />
                  <input
                    type="number"
                    value={r.weight}
                    onChange={(e) =>
                      updateReward(i, "weight", Number(e.target.value))
                    }
                    placeholder="Weight"
                    className="input"
                  />
                  <button
                    className="cb-action-btn danger"
                    onClick={() =>
                      setSpin((prev) => ({
                        ...prev,
                        rewards: prev.rewards.filter((_, idx) => idx !== i),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">No rewards defined yet.</p>
            )}

            <button
              className="cb-action-btn"
              onClick={() =>
                setSpin((prev) => ({
                  ...prev,
                  rewards: [
                    ...(Array.isArray(prev.rewards) ? prev.rewards : []),
                    { label: "", type: "coins", value: 1, weight: 10 },
                  ],
                }))
              }
              style={{ marginTop: 10 }}
            >
              + Add Reward
            </button>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="muted small">Free Spin Cooldown (hours)</label>
                <input
                  type="number"
                  value={spin.freeCooldownHours}
                  onChange={(e) =>
                    setSpin({ ...spin, freeCooldownHours: Number(e.target.value) })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="muted small">Premium Spin Cooldown (hours)</label>
                <input
                  type="number"
                  value={spin.premiumCooldownHours}
                  onChange={(e) =>
                    setSpin({
                      ...spin,
                      premiumCooldownHours: Number(e.target.value),
                    })
                  }
                  className="input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BOX CONFIG */}
        <section className="panel" style={{ marginTop: 24 }}>
          <div className="panel-inner">
            <h3 className="panel-title">🎁 Mystery Box</h3>
            <p className="muted small">Set rarity drop weights and pack size.</p>

            {Array.isArray(box?.pools) && box.pools.length > 0 ? (
              box.pools.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-3 border p-3 rounded-lg mb-2"
                >
                  <select
                    value={p.rarity}
                    onChange={(e) =>
                      updatePool(i, "rarity", e.target.value as BoxPool["rarity"])
                    }
                    className="input"
                  >
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                  <input
                    type="number"
                    value={p.weight}
                    onChange={(e) =>
                      updatePool(i, "weight", Number(e.target.value))
                    }
                    placeholder="Weight"
                    className="input"
                  />
                  <button
                    className="cb-action-btn danger"
                    onClick={() =>
                      setBox((prev) => ({
                        ...prev,
                        pools: prev.pools.filter((_, idx) => idx !== i),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">No rarity pools defined yet.</p>
            )}

            <button
              className="cb-action-btn"
              onClick={() =>
                setBox((prev) => ({
                  ...prev,
                  pools: [
                    ...(Array.isArray(prev.pools) ? prev.pools : []),
                    { rarity: "Common", weight: 60 },
                  ],
                }))
              }
              style={{ marginTop: 10 }}
            >
              + Add Pool
            </button>

            <div className="mt-4">
              <label className="muted small">Cards per Box</label>
              <input
                type="number"
                value={box.packSize}
                onChange={(e) =>
                  setBox({ ...box, packSize: Number(e.target.value) })
                }
                className="input"
              />
            </div>
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <button className="cb-action-btn" onClick={() => saveConfig(false)}>
            💾 Save Draft
          </button>
          <button
            className="cb-action-btn"
            style={{ background: "#2E5632", color: "#fff" }}
            onClick={() => saveConfig(true)}
          >
            🚀 Publish Config
          </button>
        </div>
      </div>
    </main>
  );
}
