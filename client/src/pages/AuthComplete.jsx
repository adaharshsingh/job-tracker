import { useEffect } from "react";
import axios from "axios";

export default function AuthComplete() {
  useEffect(() => {
    // Verify cookie was accepted by calling /me on the API
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/me`, {
        withCredentials: true
      })
      .then(() => {
        // Cookie accepted, redirect to dashboard
        window.location.href = "/dashboard";
      })
      .catch(() => {
        // Cookie failed, redirect to login
        window.location.href = "/";
      });
  }, []);

  return <div>Completing authentication...</div>;
}
