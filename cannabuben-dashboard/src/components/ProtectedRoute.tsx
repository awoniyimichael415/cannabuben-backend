import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
