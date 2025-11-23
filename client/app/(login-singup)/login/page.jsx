"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-soft"></div>
      
      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-ai-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-ai-purple rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 btn-gradient rounded-2xl shadow-lg">
              <img src="/logo1.png" alt="logo" className="h-10 w-10" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-gradient">
                AI Coach
              </span>
              <p className="text-xs text-slate-600">Presentation Mastery</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl shadow-glass p-10 border border-primary-200/30 max-w-full overflow-hidden">
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="text-gradient">
              Welcome Back 👋
            </span>
          </h1>
          <p className="text-center text-slate-600 text-sm mb-8">Sign in to continue your journey</p>

          <form className="space-y-6 w-full max-w-full" onSubmit={handleSubmit}>
            <div className="w-full">
              <label
                htmlFor="email"
                className="text-slate-700 text-sm font-semibold mb-2 block"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                placeholder="you@example.com"
                required
                onChange={onChange}
                value={credentials.email}
              />
            </div>

            <div className="w-full">
              <label
                htmlFor="password"
                className="text-slate-700 text-sm font-semibold mb-2 block"
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full box-border px-4 py-3 pr-12 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                  onChange={onChange}
                  value={credentials.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none z-10 pointer-events-auto"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-primary-600 text-sm font-semibold hover:text-primary-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
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
              className="w-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold transition-all shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-slate-600 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
