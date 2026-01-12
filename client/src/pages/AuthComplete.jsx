import { useEffect } from "react";
import api from "../api/client";

export default function AuthComplete() {
  useEffect(() => {
    // Verify cookie was accepted by calling /me on the API
    api
      .get("/me")
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
