import { useEffect } from "react";
import api from "../api/client";

export default function AuthComplete() {
  useEffect(() => {
    api
      .get("/me", { withCredentials: true })
      .then(res => {
        if (res.data) {
          window.location.replace("/dashboard");
        } else {
          window.location.replace("/");
        }
      })
      .catch(() => {
        window.location.replace("/");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Completing authentication…
    </div>
  );
}