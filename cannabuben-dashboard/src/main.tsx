import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import Cards from "./pages/Cards";
import Profile from "./pages/Profile"; // ✅ new import
import Auth from "./pages/Auth";
import "./styles/dashboard.css";

const router = createBrowserRouter([
  { path: "/login", element: <Auth /> },
  { path: "/", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/games", element: <ProtectedRoute><Games /></ProtectedRoute> },
  { path: "/cards", element: <ProtectedRoute><Cards /></ProtectedRoute> },
  { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> }, // ✅ new route
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
