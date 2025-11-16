"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use environment variable or default to localhost:5000
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const text = await response.text();
        let errorMsg = "Login failed";
        try {
          const data = JSON.parse(text);
          errorMsg = data?.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${response.status}`;
        }
        throw new Error(errorMsg);
      }

      const json = await response.json();

      if (json.token) {
        localStorage.setItem("token", json.token);
        if (json.username) localStorage.setItem("username", json.username);
        if (json.userId) localStorage.setItem("userId", json.userId);

        router.push("/dashboard");
      } else {
        throw new Error(json.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      // Check if it's a connection error
      if (err.message.includes("Failed to fetch") || err.message.includes("ERR_CONNECTION_REFUSED")) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:5000");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <img src="/logo1.png" alt="logo" className="h-10 w-10" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                AI Coach
              </span>
              <p className="text-xs text-white/60">Presentation Mastery</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Welcome Back 👋
            </span>
          </h1>
          <p className="text-center text-white/70 text-sm mb-8">Sign in to continue your journey</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="text-white text-sm font-semibold mb-2 block"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-xl border border-white/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50"
                placeholder="you@example.com"
                required
                onChange={onChange}
                value={credentials.email}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-white text-sm font-semibold mb-2 block"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 rounded-xl border border-white/30 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50"
                placeholder="••••••••"
                required
                onChange={onChange}
                value={credentials.password}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
                {error.includes("Cannot connect to server") && (
                  <p className="text-red-500 text-xs mt-2">
                    💡 To start the backend server, run: <code className="bg-red-100 px-2 py-1 rounded">cd server && python app.py</code>
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-white/70 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-300 font-semibold hover:text-indigo-200 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
