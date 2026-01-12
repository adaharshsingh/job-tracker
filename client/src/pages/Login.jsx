import { useEffect } from "react";
import api from "../api/client";

function Login() {
  // Redirect if already logged in
  useEffect(() => {
    let mounted = true;

    api.get("/me")
      .then(res => {
        if (mounted && res.data) {
          window.location.replace("/dashboard");
        }
      })
      .catch(() => {
        // user not logged in → do nothing
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = () => {
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Job Tracker
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Track your job applications directly from Gmail
        </p>

        <button
          onClick={login}
          className="w-full rounded-md bg-cyan-600 px-4 py-2 text-white font-medium hover:bg-cyan-700 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default Login;