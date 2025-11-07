import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getEmail, clearSession } from "../lib/auth";
import { API_URL } from "../lib/api";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const [checkingBan, setCheckingBan] = useState(true);

  useEffect(() => {
    async function verifyBan() {
      const email = getEmail();
      const token = getToken();

      if (!token || !email) {
        clearSession();
        return (window.location.href = "/login");
      }

      // ✅ Ask backend if user is banned
      try {
        const res = await fetch(`${API_URL}/api/auth/check-ban?email=${email}`);
        const data = await res.json();

        if (data?.banned) {
          alert("🚫 Your account has been banned. You have been logged out.");
          clearSession();
          return (window.location.href = "/login");
        }
      } catch (e) {
        console.log("Ban check failed", e);
      }

      setCheckingBan(false);
    }

    verifyBan();
  }, []);

  if (checkingBan) return null; // avoid flashing protected content

  return <>{children}</>;
};

export default ProtectedRoute;
