import React, { useState } from "react";
import "../styles/dashboard.css";

interface DailySpinProps {
  email: string;
  onCoinsUpdated?: (coins: number) => void;
}

const DailySpin: React.FC<DailySpinProps> = ({ email, onCoinsUpdated }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const prizes = [5, 10, 15, 20, 30, 50];
  const segmentAngle = 360 / prizes.length;

  const spinWheel = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const won = prizes[prizeIndex];

    const randomFullRotations = 5 + Math.floor(Math.random() * 3);
    const finalRotation =
      randomFullRotations * 360 +
      (360 - prizeIndex * segmentAngle) -
      segmentAngle / 2;

    setRotation(finalRotation);

    setTimeout(async () => {
      setSpinning(false);
      setResult(won);

      try {
        const res = await fetch("http://localhost:5000/api/spin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, coins: won }),
        });
        const data = await res.json();
        if (onCoinsUpdated) onCoinsUpdated(data.newCoins);
      } catch (err) {
        console.error("Error sending result:", err);
      }
    }, 5000);
  };

  return (
    <div className="spin-container">
      <div className="wheel-wrapper">
        {/* Wheel */}
        <div
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition:
              "transform 5s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
          }}
        >
          <div className="center-circle">🌿</div>

          {prizes.map((value, i) => {
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
                {value}
              </div>
            );
          })}
        </div>

        {/* Pointer */}
        <div className="pointer" />
      </div>

      <button
        onClick={spinWheel}
        disabled={spinning}
        className={`spin-button ${spinning ? "disabled" : ""}`}
      >
        {spinning ? "Spinning..." : "SPIN NOW"}
      </button>

      {result && (
        <div className="result-text">🎉 You won {result} coins!</div>
      )}
    </div>
  );
};

export default DailySpin;
