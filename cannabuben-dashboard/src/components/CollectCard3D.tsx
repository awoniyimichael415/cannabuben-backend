import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CollectCardProps {
  email: string;
  onCoinsUpdated: (newCoins: number) => void;
}

const CardMesh: React.FC<{ flipped: boolean }> = ({ flipped }) => {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (flipped && mesh.current.rotation.y < Math.PI) {
      mesh.current.rotation.y += 0.1;
    }
  });

  return (
    <mesh ref={mesh} rotation={[0, flipped ? Math.PI : 0, 0]}>
      <boxGeometry args={[1.5, 2, 0.05]} />
      <meshStandardMaterial
        attach="material"
        color={flipped ? "#facc15" : "#16a34a"}
        metalness={0.4}
        roughness={0.3}
      />
    </mesh>
  );
};

const CollectCard3D: React.FC<CollectCardProps> = ({ email, onCoinsUpdated }) => {
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState("");

  const handleCollect = async () => {
    if (!email) {
      setMessage("Please enter your email first!");
      return;
    }

    setFlipped(true);
    setMessage("Revealing your card... 🎴");

    setTimeout(async () => {
      const coinsEarned = Math.floor(Math.random() * 30) + 10;

      try {
        const res = await fetch("http://localhost:5000/api/collect-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, coins: coinsEarned }),
        });

        const data = await res.json();
        if (data.success) {
          onCoinsUpdated(data.total);
          setMessage(`You earned ${coinsEarned} coins! 💰`);
        } else {
          setMessage("Collection failed!");
        }
      } catch {
        setMessage("Server error!");
      }

      setFlipped(false);
    }, 2500);
  };

  return (
    <div className="collect-card-3d">
      <h3>🃏 Collect Card</h3>
      <div style={{ width: "100%", height: "250px", borderRadius: "12px", overflow: "hidden" }}>
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 2, 5]} intensity={1.5} />
          <CardMesh flipped={flipped} />
          <OrbitControls />
        </Canvas>
      </div>

      <button className="gold-btn" onClick={handleCollect} disabled={flipped}>
        {flipped ? "Collecting..." : "Collect Card"}
      </button>

      <p>{message}</p>
    </div>
  );
};

export default CollectCard3D;
