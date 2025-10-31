import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { apiGet, apiPost } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";


interface SpinReward {
  label: string;
  type: "coins" | "mystery_box" | "extra_spin" | "nothing";
  value: number;
  weight: number;
}

interface SpinConfig {
  _id?: string;
  rewards: SpinReward[];
  freeCooldownHours: number;
  premiumCooldownHours: number;
  version: number;
  status?: string;
}

interface BoxPool {
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  weight: number;
}

interface BoxConfig {
  _id?: string;
  pools: BoxPool[];
  packSize: number;
  version: number;
  status?: string;
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

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/games");
      const data = await res.json();
      if (data.success) {
        setSpin(data.data.spin);
        setBox(data.data.box);
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
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  }

  function updateReward(i: number, field: keyof SpinReward, value: any) {
    setSpin((prev) => {
      const rewards = [...prev.rewards];
      rewards[i] = { ...rewards[i], [field]: value };
      return { ...prev, rewards };
    });
  }

  function updatePool(i: number, field: keyof BoxPool, value: any) {
    setBox((prev) => {
      const pools = [...prev.pools];
      pools[i] = { ...pools[i], [field]: value };
      return { ...prev, pools };
    });
  }

  if (loading) return <p className="p-6">Loading game configuration...</p>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">🎮 Game Configuration</h1>

      {/* Spin Config */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-medium">Spin the Wheel</h2>
          <p className="text-sm text-gray-500">
            Configure spin rewards and cooldowns.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {spin.rewards?.length > 0 ? (
            spin.rewards.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-2 items-center border p-3 rounded-lg"
              >
                <Input
                  value={r.label}
                  onChange={(e) => updateReward(i, "label", e.target.value)}
                  placeholder="Label"
                />
                <select
                  value={r.type}
                  onChange={(e) =>
                    updateReward(
                      i,
                      "type",
                      e.target.value as SpinReward["type"]
                    )
                  }
                  className="border p-2 rounded-md"
                >
                  <option value="coins">Coins</option>
                  <option value="mystery_box">Mystery Box</option>
                  <option value="extra_spin">Extra Spin</option>
                  <option value="nothing">Nothing</option>
                </select>
                <Input
                  type="number"
                  value={r.value}
                  onChange={(e) =>
                    updateReward(i, "value", Number(e.target.value))
                  }
                  placeholder="Value"
                />
                <Input
                  type="number"
                  value={r.weight}
                  onChange={(e) =>
                    updateReward(i, "weight", Number(e.target.value))
                  }
                  placeholder="Weight"
                />
                <Button
                  variant="destructive"
                  onClick={() =>
                    setSpin((prev) => ({
                      ...prev,
                      rewards: prev.rewards.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No rewards defined.</p>
          )}
          <Button
            onClick={() =>
              setSpin((prev) => ({
                ...prev,
                rewards: [
                  ...prev.rewards,
                  {
                    label: "",
                    type: "coins",
                    value: 1,
                    weight: 10,
                  },
                ],
              }))
            }
          >
            + Add Reward
          </Button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Free Spin Cooldown (hours)</Label>
              <Input
                type="number"
                value={spin.freeCooldownHours}
                onChange={(e) =>
                  setSpin({ ...spin, freeCooldownHours: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Premium Spin Cooldown (hours)</Label>
              <Input
                type="number"
                value={spin.premiumCooldownHours}
                onChange={(e) =>
                  setSpin({
                    ...spin,
                    premiumCooldownHours: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Box Config */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-medium">Mystery Box</h2>
          <p className="text-sm text-gray-500">
            Configure drop rates and pack size.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {box.pools?.length > 0 ? (
            box.pools.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-3 items-center border p-3 rounded-lg"
              >
                <select
                  value={p.rarity}
                  onChange={(e) =>
                    updatePool(i, "rarity", e.target.value as BoxPool["rarity"])
                  }
                  className="border p-2 rounded-md"
                >
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
                <Input
                  type="number"
                  value={p.weight}
                  onChange={(e) =>
                    updatePool(i, "weight", Number(e.target.value))
                  }
                  placeholder="Weight"
                />
                <Button
                  variant="destructive"
                  onClick={() =>
                    setBox((prev) => ({
                      ...prev,
                      pools: prev.pools.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No rarity pools defined.</p>
          )}
          <Button
            onClick={() =>
              setBox((prev) => ({
                ...prev,
                pools: [
                  ...prev.pools,
                  {
                    rarity: "Common",
                    weight: 60,
                  },
                ],
              }))
            }
          >
            + Add Pool
          </Button>

          <div className="mt-4">
            <Label>Cards per Box</Label>
            <Input
              type="number"
              value={box.packSize}
              onChange={(e) =>
                setBox({ ...box, packSize: Number(e.target.value) })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => saveConfig(false)}>💾 Save Draft</Button>
        <Button
          onClick={() => saveConfig(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          🚀 Publish Config
        </Button>
      </div>
    </div>
  );
}
