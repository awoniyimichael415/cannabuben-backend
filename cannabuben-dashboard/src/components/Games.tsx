export default function Games() {
  return (
    <div style={{ padding: 30 }}>
      <h2>Play & Win</h2>
      <p>Try your luck and earn extra coins by playing simple games.</p>

      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>🎡 Spin the Wheel</h3>
          <p>Coming soon</p>
          <button
            style={{
              backgroundColor: "var(--coin-gold)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
            }}
            disabled
          >
            Play
          </button>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>🃏 Card Pack Opening</h3>
          <p>Coming soon</p>
          <button
            style={{
              backgroundColor: "var(--coin-gold)",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
            }}
            disabled
          >
            Open a Pack
          </button>
        </div>
      </div>
    </div>
  );
}
