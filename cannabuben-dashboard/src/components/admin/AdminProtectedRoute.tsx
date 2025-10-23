import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../../lib/adminAuth";

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loc = useLocation();
  const token = getAdminToken();

  // If no admin token, send to admin login
  if (!token) return <Navigate to="/admin/login" state={{ from: loc }} replace />;

  return <>{children}</>;
};

export default AdminProtectedRoute;
