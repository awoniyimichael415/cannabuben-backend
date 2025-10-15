import { useEffect, useState } from "react";

export default function Dashboard() {
  const [coins, setCoins] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function fetchCoins() {
    if (!email) return;
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setCoins(data.coins || 0);
      setError("");
    } catch (err) {
      setError("Unable to fetch coins");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Optional: auto load if user already stored in localStorage
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      fetchCoins();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userEmail", email);
    fetchCoins();
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>My Points</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            width: "100%",
            maxWidth: 300,
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "var(--leaf-green)",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            marginLeft: 10,
          }}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginTop: 30, fontSize: 24 }}>
        🪙 <b>{coins}</b> coins
      </div>
    </div>
  );
}
