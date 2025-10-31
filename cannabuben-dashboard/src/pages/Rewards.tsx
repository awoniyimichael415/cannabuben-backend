// src/pages/RewardsPage.tsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";
import { apiGet, apiPost } from "../lib/api";
import { getEmail } from "../lib/auth";
import logo from "../assets/logo.png";
import coinIcon from "../assets/logo-icon.png";

interface Reward {
  _id: string;
  title: string;
  description?: string;
  priceCoins: number;
  stock: number;
  imageUrl?: string;
  type: "coupon" | "mysteryBox" | "spinTicket" | "item";
  status?: string;
  terms?: string;
  featured?: boolean;
}

export default function RewardsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [boxes, setBoxes] = useState<number>(0);
  const [spinTickets, setSpinTickets] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const e = getEmail();
    setEmail(e);
    loadAll(e || "");
  }, []);

  async function loadAll(userEmail: string) {
    setLoading(true);
    setMessage("");

    try {
      // Load rewards
      const resRewards = await apiGet("/api/rewards/all");
      const rewardsJson = await resRewards.json();
      if (rewardsJson?.success && Array.isArray(rewardsJson.rewards)) {
        setRewards(
          rewardsJson.rewards.filter(
            (r: Reward) =>
              (r.status === "active" || r.status === undefined) &&
              (r.stock === -1 || r.stock > 0)
          )
        );
      }

      // Load user stats (coins, boxes, spinTickets)
      if (userEmail) {
        const resUser = await apiGet(`/api/user?email=${encodeURIComponent(userEmail)}`);
        const userJson = await resUser.json();
        if (userJson) {
          setUserCoins(userJson.coins || 0);
          setBoxes(userJson.boxes || userJson.boxesOwned || 0);
          setSpinTickets(userJson.spinTickets || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load rewards:", err);
      setMessage("Could not load rewards. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem(rewardId: string) {
    if (!email) return setMessage("You must be logged in.");
    setRedeemingId(rewardId);
    setMessage("");

    try {
      
      const res = await apiPost("/api/rewards/redeem", { email, rewardId });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "Redemption failed.");
        setRedeemingId(null);
        return;
      }

      // ✅ Update counts immediately
      setUserCoins(data.user?.coins ?? userCoins);
      setBoxes(data.user?.boxes ?? boxes);
      setSpinTickets(data.user?.spinTickets ?? spinTickets);

      let extra = "";
      if (data.reward?.type === "mysteryBox") extra = " 🎁 You received a Mystery Box!";
      if (data.reward?.type === "spinTicket") extra = " 🎟 You received a Spin Ticket!";

      setMessage(`${data.message || "Reward redeemed successfully."}${extra}`);

      // Update stock locally
      setRewards((prev) =>
        prev.map((r) =>
          r._id === rewardId
            ? { ...r, stock: r.stock === -1 ? -1 : Math.max(r.stock - 1, 0) }
            : r
        )
      );
    } catch (err) {
      console.error("Redeem error:", err);
      setMessage("Server error while redeeming.");
    } finally {
      setRedeemingId(null);
    }
  }

  function typeLabel(t: Reward["type"]) {
    if (t === "mysteryBox") return "Mystery Box";
    if (t === "spinTicket") return "Spin Ticket";
    if (t === "coupon") return "Coupon";
    return "Reward";
  }

  function isOut(r: Reward) {
    return r.stock !== -1 && r.stock <= 0;
  }

  function canAfford(r: Reward) {
    return userCoins >= r.priceCoins;
  }

  return (
    <main className="grovi-main">
      {/* 🔝 NAVBAR */}
      <div className="grovi-topnav">
        <div className="grovi-top-logo">
          <img src={logo} alt="Grovi" />
        </div>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Dashboard
        </NavLink>
        <NavLink to="/games" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Games
        </NavLink>
        <NavLink to="/cards" className={({ isActive }) => (isActive ? "toplink active" : "toplink")}>
          Cards
        </NavLink>
        <NavLink
          to="/rewards"
          className={({ isActive }) => (isActive ? "toplink active" : "toplink")}
        >
          Rewards
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "toplink active" : "toplink")}
        >
          Profile
        </NavLink>

        <div className="grovi-coin-pill">
          <img src={coinIcon} alt="Coins" />
          <span>{userCoins ?? 0}</span>
        </div>
      </div>

      {/* 🪙 USER SUMMARY */}
      <div className="panel" style={{ marginBottom: "18px" }}>
        <div className="panel-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--green)" }}>🎁 Rewards</div>
            <div style={{ fontSize: "14px", color: "#555" }}>
              Spend your Grovi Coins to unlock boxes and spin tickets.
            </div>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#2E5632" }}>
              💰 Coins: <b>{userCoins}</b> | 🎁 Boxes: <b>{boxes}</b> | 🎟 Spin Tickets:{" "}
              <b>{spinTickets}</b>
            </div>
            {message && (
              <div
                style={{
                  background: "#fff7d1",
                  border: "1px solid #e6d27a",
                  borderRadius: "10px",
                  padding: "8px 10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#554400",
                  maxWidth: "360px",
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 REWARDS GRID */}
      <div className="panel">
        <div className="panel-inner">
          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(260px,100%),1fr))",
            }}
          >
            {loading ? (
              <div style={{ fontSize: "14px", color: "#666" }}>Loading rewards…</div>
            ) : rewards.length === 0 ? (
              <div style={{ fontSize: "14px", color: "#666" }}>No rewards available.</div>
            ) : (
              rewards.map((reward) => {
                const soldOut = isOut(reward);
                const unaffordable = !canAfford(reward);
                return (
                  <div
                    key={reward._id}
                    style={{
                      background: "#F7F2E4",
                      border: "1px solid var(--stroke)",
                      borderRadius: "14px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "12px",
                          background: "#fff",
                          border: "1px solid var(--stroke)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "28px",
                          overflow: "hidden",
                        }}
                      >
                        {reward.imageUrl ? (
                          <img
                            src={reward.imageUrl}
                            alt={reward.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          "🎁"
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "#2b2b2b" }}>{reward.title}</div>
                        <div style={{ fontSize: "13px", color: "#555" }}>
                          {reward.description || "No description"}
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                          <span className="pill small">{typeLabel(reward.type)}</span>
                          {reward.stock !== -1 && (
                            <span className="pill small">
                              {soldOut ? "Sold Out" : `${reward.stock} left`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "var(--green)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <img src={coinIcon} alt="coin" style={{ width: "20px", height: "20px" }} />
                        <span>{reward.priceCoins} Coins</span>
                      </div>
                      <button
                        className="tile-btn"
                        disabled={soldOut || unaffordable || redeemingId === reward._id}
                        onClick={() => {
                          if (soldOut) return setMessage("This reward is sold out.");
                          if (unaffordable) return setMessage("Not enough coins.");
                          handleRedeem(reward._id);
                        }}
                      >
                        {redeemingId === reward._id ? "Working..." : "Redeem"}
                      </button>
                    </div>

                    {reward.terms && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#777",
                          marginTop: "10px",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {reward.terms}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
