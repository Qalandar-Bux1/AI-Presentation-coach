"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || email.trim() === "") {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("ERR_CONNECTION_REFUSED")) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Pattern - matches landing page */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0, 217, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Gradient Orbs - matches landing page */}
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
              Forgot Password?
            </span>
          </h1>
          <p className="text-center text-slate-600 text-sm mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {success ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-4 border-green-300">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-800 mb-6 font-medium">
                If an account exists with this email, a password reset link has been sent. Please check your inbox.
              </p>
              <Link
                href="/login"
                className="inline-block w-full btn-gradient text-white rounded-xl py-3 font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
              >
                Back to Login
              </Link>
            </div>
          ) : (
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
                  id="email"
                  className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="you@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-slate-600 text-sm">
                Remember your password?{" "}
                <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

