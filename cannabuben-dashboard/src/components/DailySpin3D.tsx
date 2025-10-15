import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface DailySpinProps {
  email: string;
  onCoinsUpdated: (newCoins: number) => void;
}

const Wheel: React.FC<{ spinning: boolean }> = ({ spinning }) => {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (spinning && mesh.current) {
      mesh.current.rotation.z += 0.15; // rotation speed
    }
  });

  return (
    <mesh ref={mesh} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1, 1, 0.2, 32]} />
      <meshStandardMaterial color="#16a34a" metalness={0.3} roughness={0.4} />
    </mesh>
  );
};

const DailySpin3D: React.FC<DailySpinProps> = ({ email, onCoinsUpdated }) => {
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");

  const spinWheel = async () => {
    if (!email) {
      setMessage("Please enter your email first!");
      return;
    }

    setSpinning(true);
    setMessage("Spinning... 🎡");

    // Wait 3 seconds for spin
    setTimeout(async () => {
      const coinsWon = Math.floor(Math.random() * 50) + 10;

      try {
        const res = await fetch("http://localhost:5000/api/spin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, coins: coinsWon }),
        });

        const data = await res.json();
        if (data.success) {
          onCoinsUpdated(data.total);
          setMessage(`You won ${coinsWon} coins! 💰`);
        } else {
          setMessage("Spin failed!");
        }
      } catch {
        setMessage("Server error!");
      }

      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="daily-spin-3d">
      <h3>🎯 Daily Spin</h3>
      <div style={{ width: "100%", height: "250px", borderRadius: "12px", overflow: "hidden" }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 3, 3]} intensity={1.2} />
          <Wheel spinning={spinning} />
          <OrbitControls />
        </Canvas>
      </div>
      <button className="gold-btn" onClick={spinWheel} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin Now"}
      </button>
      <p>{message}</p>
    </div>
  );
};

export default DailySpin3D;
