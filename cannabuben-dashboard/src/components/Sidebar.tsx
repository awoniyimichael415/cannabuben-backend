import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: 200,
        backgroundColor: "var(--leaf-green)",
        height: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>CannaBuben</h2>
      <NavLink to="/" style={linkStyle}>
        Dashboard
      </NavLink>
      <NavLink to="/games" style={linkStyle}>
        Games
      </NavLink>
      <NavLink to="/cards" style={linkStyle}>
        Cards
      </NavLink>
    </div>
  );
}

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? "var(--coin-gold)" : "white",
  textDecoration: "none",
  marginBottom: "12px",
  fontWeight: isActive ? "bold" : "normal",
});
