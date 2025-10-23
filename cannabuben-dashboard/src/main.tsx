import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ===== PROTECTED ROUTES =====
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

// ===== USER PAGES =====
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Cards from "./pages/Cards";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";

// ===== ADMIN PAGES =====
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard"; // legacy dashboard shell
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminRewards from "./pages/admin/Rewards";
import AdminCards from "./pages/admin/Cards";
import AdminTransactions from "./pages/admin/Transactions";
import AdminGames from "./pages/admin/Games";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

// ===== STYLES =====
import "./styles/dashboard.css";

// ==========================================================
// ROUTER CONFIGURATION
// ==========================================================
const router = createBrowserRouter([
  // ============ USER ROUTES ============
  { path: "/login", element: <Auth /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
  path: "/admin",
  element: (
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  ),
  children: [
    { index: true, element: <AdminOverview /> },
    // ...other admin routes
  ],
},
  {
    path: "/games",
    element: (
      <ProtectedRoute>
        <Games />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cards",
    element: (
      <ProtectedRoute>
        <Cards />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  // ============ ADMIN LOGIN ============
  { path: "/admin/login", element: <AdminLogin /> },

  // ============ ADMIN DASHBOARD ============
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: "users", element: <AdminUsers /> },
      { path: "rewards", element: <AdminRewards /> },
      { path: "cards", element: <AdminCards /> },
      { path: "transactions", element: <AdminTransactions /> },
      { path: "games", element: <AdminGames /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },

  // ============ OPTIONAL LEGACY FALLBACK ============
  // If someone directly goes to /admin/* and not covered above,
  // render the old AdminDashboard shell to avoid 404
  { path: "/admin/*", element: <AdminDashboard /> },
]);

// ==========================================================
// RENDER APP
// ==========================================================
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
