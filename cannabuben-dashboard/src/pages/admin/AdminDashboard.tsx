import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAdminToken, clearAdminSession } from "../../lib/adminAuth";
import { API_URL } from "../../lib/api";
import "../../styles/dashboard.css";
import logo from "../../assets/logo.png";

const AdminDashboard: React.FC = () => {
  const nav = useNavigate();
  const [ping, setPing] = useState<string>("…");

  useEffect(() => {
    // simple probe of protected endpoint
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        const json = await res.json();
        setPing(res.ok && json?.success ? "Admin API OK" : "Auth failed");
      } catch {
        setPing("Network error");
      }
    })();
  }, []);

  function logout() {
    clearAdminSession();
    nav("/admin/login", { replace: true });
  }

  return (
    <div className="grovi-root">
      {/* Sidebar (hidden on small screens by your CSS) */}
      <aside className="grovi-sidebar">
        <nav className="grovi-sidenav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">📊</span> Overview
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">👥</span> Users
          </NavLink>

          <NavLink
            to="/admin/rewards"
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">🎁</span> Rewards
          </NavLink>

          <NavLink
            to="/admin/drops"
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">🎯</span> Drop Rates
          </NavLink>

          <NavLink
            to="/admin/cards"
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">🃏</span> Cards
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">📈</span> Analytics
          </NavLink>

          {/* 🧾 NEW: Audit Logs nav item */}
          <NavLink
            to="/admin/logs"
            className={({ isActive }) => "sidelink" + (isActive ? " active" : "")}
          >
            <span className="icon">🧾</span> Audit Logs
          </NavLink>
        </nav>

        <div className="grovi-sidebar-bottom">
          <button className="grovi-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="grovi-main">
        <div className="grovi-topnav">
          <div className="grovi-top-logo">
            <img src={logo} alt="Grovi" />
          </div>

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/rewards"
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Rewards
          </NavLink>

          <NavLink
            to="/admin/drops"
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Drop Rates
          </NavLink>

          <NavLink
            to="/admin/cards"
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Cards
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Analytics
          </NavLink>

          {/* 🧾 NEW: Audit Logs in top nav */}
          <NavLink
            to="/admin/logs"
            className={({ isActive }) =>
              isActive ? "toplink active" : "toplink"
            }
          >
            Audit Logs
          </NavLink>

          <div
            style={{
              marginLeft: "auto",
              fontWeight: 700,
              color: "#2E5632",
            }}
          >
            {ping}
          </div>
        </div>

        <div
          className="grovi-grid"
          style={{
            gridTemplateAreas: `"mypoints playwin" "mycards mycards"`,
          }}
        >
          <section className="panel mypoints">
            <div className="panel-inner">
              <h3 className="panel-title">Quick Actions</h3>
              <ul className="muted">
                <li>Adjust spin probabilities</li>
                <li>Create a reward</li>
                <li>Upload new card art</li>
              </ul>
            </div>
          </section>

          <section className="panel playwin">
            <div className="panel-inner">
              <h3 className="panel-title">System Status</h3>
              <p className="muted">Everything looks good.</p>
            </div>
          </section>

          <section className="panel mycards">
            <div className="panel-inner">
              <h3 className="panel-title">Recent Activity</h3>
              <p className="muted small">
                This is a placeholder—wire to real data as we add endpoints.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
