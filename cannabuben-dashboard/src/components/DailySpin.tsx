import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { apiGet, apiPost } from "../lib/api";

interface DailySpinProps {
  email: string;
  onCoinsUpdated?: (coins: number) => void;
}

const DailySpin: React.FC<DailySpinProps> = ({ email, onCoinsUpdated }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<"free" | "premium">("free");
  const [spinTickets, setSpinTickets] = useState<number>(0);

  const prizes = ["+1 Coin", "+5 Coins", "+10 Coins", "+25 Coins", "Mystery Box", "+0 coin"];
  const segmentAngle = 360 / prizes.length;

  // 🧠 Fetch user spin tickets and coins
  useEffect(() => {
    if (!email) return;
    (async () => {
      try {
        const res = await apiGet(`/api/user?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (typeof data.coins === "number" && onCoinsUpdated) onCoinsUpdated(data.coins);
        if (typeof data.spinTickets === "number") setSpinTickets(data.spinTickets);
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    })();
  }, [email]);

  const spinWheel = async () => {
    if (!email) {
      alert("Please log in first.");
      return;
    }
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    try {
      const res = await apiPost("/api/spin", { email, mode });
      const data = await res.json();

      if (!data.success) {
        setSpinning(false);
        alert(data.error || "Spin unavailable right now.");
        return;
      }

      const prizeIndex =
        prizes.findIndex((p) => p === data.outcome) !== -1
          ? prizes.findIndex((p) => p === data.outcome)
          : 0;

      const randomFullRotations = 5 + Math.floor(Math.random() * 3);
      const finalRotation =
        randomFullRotations * 360 +
        (360 - prizeIndex * segmentAngle) -
        segmentAngle / 2;

      setRotation(finalRotation);

      setTimeout(() => {
        setSpinning(false);

        if (data.mysteryBoxes > 0) {
          setResult("🎁 You won a Mystery Box!");
        } else if (data.prize > 0) {
          setResult(`🎉 You won +${data.prize} coins!`);
        } else {
          setResult("Nothing this time, try again!");
        }

        if (onCoinsUpdated) onCoinsUpdated(data.totalCoins ?? 0);
        if (data.spinTickets !== undefined) setSpinTickets(data.spinTickets);
      }, 5000);
    } catch (err) {
      console.error("Spin error:", err);
      setSpinning(false);
      alert("Server error while spinning.");
    }
  };

  return (
    <div className="spin-container">
      <div className="wheel-wrapper">
        <div
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 5s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
          }}
        >
          <div className="center-circle">🌿</div>
          {prizes.map((label, i) => {
            const angle = i * segmentAngle;
            return (
              <div
                key={i}
                className="prize-text"
                style={{
                  transform: `rotate(${angle + segmentAngle / 2}deg)
                               translateY(-115px)
                               rotate(-${angle + segmentAngle / 2}deg)`,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
        <div className="pointer" />
      </div>

      <div className="spin-controls">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "free" | "premium")}
          disabled={spinning}
        >
          <option value="free">Free Spin</option>
          <option value="premium">Premium Spin</option>
        </select>
        <button
          onClick={spinWheel}
          disabled={spinning}
          className={`spin-button ${spinning ? "disabled" : ""}`}
        >
          {spinning ? "Spinning..." : "SPIN NOW"}
        </button>
      </div>

      <div className="spin-tickets-info">
        🎟 Spin Tickets: {spinTickets}
      </div>

      {result && <div className="result-text">{result}</div>}
    </div>
  );
};

export default DailySpin;
