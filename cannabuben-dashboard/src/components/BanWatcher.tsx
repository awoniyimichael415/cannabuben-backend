// src/components/BanWatcher.tsx
import React, { useEffect, useRef } from "react";
import { getEmail, clearSession } from "../lib/auth";
import { API_URL } from "../lib/api";
import toast from "react-hot-toast"; // optional — you already use toast elsewhere

/**
 * Polls /api/auth/check-ban?email=... every `intervalMs` milliseconds.
 * If banned -> clear session and redirect to /login
 *
 * Uses clearSession() from your existing auth.ts (we do NOT touch auth.ts).
 */
const BanWatcher: React.FC<{ intervalMs?: number }> = ({ intervalMs = 10_000 }) => {
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    const email = getEmail();
    if (!email) return; // not logged in -> nothing to watch

    async function checkBanOnce() {
      try {
        const url = `${API_URL}/api/auth/check-ban?email=${encodeURIComponent(
          email
        )}`;
        const res = await fetch(url, { credentials: "same-origin" });
        // if backend missing route returns HTML (doctype) or 404 -> handle gracefully
        if (!res.ok) {
          // 401/403/404 -> ignore or log; do not auto-logout for transient errors
          console.warn("BanWatcher: check-ban returned", res.status);
          return;
        }
        const json = await res.json();
        if (json?.banned === true) {
          // show message and force logout
          try {
            toast?.error?.("Your account has been banned. You have been logged out.");
          } catch (e) {
            // toast not available — fallback
            // eslint-disable-next-line no-alert
            alert("Your account has been banned. You have been logged out.");
          }

          // clear session using existing helper
          clearSession();

          // full redirect to login page
          window.location.href = "/login";
        }
      } catch (err) {
        console.warn("BanWatcher error:", err);
        // ignore network hiccups
      }
    }

    // run immediately then every interval
    checkBanOnce();
    runningRef.current = true;
    timerRef.current = window.setInterval(checkBanOnce, intervalMs) as unknown as number;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      runningRef.current = false;
    };
  }, [intervalMs]);

  return null; // invisible component
};

export default BanWatcher;
