export default function Navbar({ coins }: { coins: number }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3>CannaBuben Dashboard</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "var(--coin-gold)",
          borderRadius: 20,
          padding: "6px 12px",
          color: "white",
          fontWeight: "bold",
        }}
      >
        🪙 {coins ?? 0}
      </div>
    </div>
  );
}
