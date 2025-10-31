import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logo from "../../assets/logo.png";

const AdminLayout: React.FC = () => {
  const nav = useNavigate();

  const logout = () => {
    // keep same behavior as user logout
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role"); // important for admin guard
    nav("/login", { replace: true });
  };

  return (
    <div className="admin-root">
      {/* Sidebar (hidden on mobile) */}
      <aside className="admin-sidebar">
        <nav className="admin-sidenav">
          <div className="admin-section">Management</div>

          <NavLink to="/admin" end className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            📊 Overview
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            👥 Users
          </NavLink>
          <NavLink to="/admin/rewards" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            🎁 Rewards
          </NavLink>
          <NavLink to="/admin/cards" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            🃏 Cards
          </NavLink>
          <NavLink to="/admin/transactions" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            💳 Transactions
          </NavLink>

          {/* 🧾 NEW: Audit Logs link in sidebar */}
          <NavLink to="/admin/logs" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            🧾 Audit Logs
          </NavLink>

          <div className="admin-section">Game Config</div>
          <NavLink to="/admin/games" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            🎮 Games
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            📈 Analytics
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => "admin-link" + (isActive ? " active" : "")}>
            ⚙️ Settings
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="admin-main">
        {/* Top bar (logo lives here; shows on all screen sizes) */}
        <div className="admin-topnav">
          <div className="admin-top-left">
            <img src={logo} alt="Grovi" className="admin-logo" />
            <nav className="admin-top-tabs">
              <NavLink to="/admin" end className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Overview
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Users
              </NavLink>
              <NavLink to="/admin/rewards" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Rewards
              </NavLink>
              <NavLink to="/admin/cards" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Cards
              </NavLink>
              <NavLink to="/admin/transactions" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Transactions
              </NavLink>

              {/* 🧾 NEW: Audit Logs link in top navigation */}
              <NavLink to="/admin/logs" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Audit Logs
              </NavLink>

              <NavLink to="/admin/games" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Games
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Analytics
              </NavLink>
              <NavLink to="/admin/settings" className={({ isActive }) => "admin-toplink" + (isActive ? " active" : "")}>
                Settings
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Routed content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
