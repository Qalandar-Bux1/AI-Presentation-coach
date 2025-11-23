"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignUp() {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    program: "",
    phone: "",
    profession: "" // For role = other
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.name.trim()) return setError("Please enter your full name");
    if (!credentials.email.trim()) return setError("Please enter your email address");
    if (!credentials.password.trim()) return setError("Please enter a password");

    if (!strongPasswordRegex.test(credentials.password)) {
      return setError(
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
      );
    }

    if (credentials.password !== credentials.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (credentials.role === "other" && !credentials.profession.trim()) {
      return setError("Please enter your profession");
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/auth/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.name,
          email: credentials.email,
          password: credentials.password,
          role: credentials.role,
          program: credentials.program || null,
          phone: credentials.phone || null,
          profession: credentials.role === "other" ? credentials.profession : null
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = "Signup failed";

        try {
          const data = JSON.parse(text);
          errorMsg = data?.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${response.status}`;
        }

        setError(errorMsg);
        return;
      }

      const json = await response.json();

      if (json.success && json.message) {
        alert(`✅ ${json.message}`);
        router.push("/login");
      } else {
        setError("Unexpected server response.");
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Make sure backend is running at http://localhost:5000"
        );
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-soft"></div>

      <div className="absolute top-20 right-20 w-96 h-96 bg-ai-cyan rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div
        className="absolute bottom-20 left-20 w-96 h-96 bg-ai-purple rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 btn-gradient rounded-2xl shadow-lg">
              <img src="/logo1.png" alt="logo" className="h-10 w-10" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gradient">AI Coach</span>
              <p className="text-xs text-slate-600">Presentation Mastery</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl shadow-glass p-10 border border-primary-200/30">
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="text-gradient">Create Your Account ✨</span>
          </h1>
          <p className="text-center text-slate-600 text-sm mb-8">
            Join us and start improving your presentations
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                placeholder="John Doe"
                onChange={onChange}
                value={credentials.name}
              />
            </div>

            {/* Role & Profession */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 text-sm font-semibold mb-2 block">
                  Role
                </label>
                <select
                  name="role"
                  className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800"
                  onChange={onChange}
                  value={credentials.role}
                >
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {credentials.role === "other" && (
                <div>
                  <label className="text-slate-700 text-sm font-semibold mb-2 block">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Enter your profession"
                    onChange={onChange}
                    value={credentials.profession}
                  />
                </div>
              )}
            </div>

            {/* Program */}
            <div>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">
                Program (optional)
              </label>
              <input
                type="text"
                name="program"
                className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                placeholder="e.g. BSc Computer Science"
                onChange={onChange}
                value={credentials.program}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                placeholder="+1 555 000 0000"
                onChange={onChange}
                value={credentials.phone}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full box-border px-4 py-3 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                placeholder="you@example.com"
                onChange={onChange}
                value={credentials.email}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full box-border px-4 py-3 pr-12 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="••••••••"
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

            {/* Confirm Password */}
            <div>
              <label className="text-slate-700 text-sm font-semibold mb-2 block">
                Confirm Password
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="w-full box-border px-4 py-3 pr-12 rounded-xl border border-primary-200/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white/80 backdrop-blur-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="••••••••"
                  onChange={onChange}
                  value={credentials.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none z-10 pointer-events-auto"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient text-white py-4 rounded-xl font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-center text-slate-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
