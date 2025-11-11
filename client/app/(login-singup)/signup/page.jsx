"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (credentials.password !== credentials.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.name,
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const json = await response.json();
    setLoading(false);

    if (!response.ok) {
      throw new Error(json.error || "Signup failed");
    }

    // ✅ Show message & redirect to login
    alert("🎉 Account created successfully! Please log in.");
    router.push("/login");

  } catch (err) {
    setError(err.message || "Something went wrong. Try again.");
    setLoading(false);
  }
};

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Create Your Account ✨
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="text-gray-700 text-sm font-medium mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              placeholder="John Doe"
              required
              onChange={onChange}
              value={credentials.name}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-gray-700 text-sm font-medium mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              placeholder="you@example.com"
              required
              onChange={onChange}
              value={credentials.email}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-gray-700 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              placeholder="••••••••"
              required
              onChange={onChange}
              value={credentials.password}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-gray-700 text-sm font-medium mb-2 block"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              placeholder="••••••••"
              required
              onChange={onChange}
              value={credentials.confirmPassword}
            />
          </div>

          {error && (
            <p className="text-center text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-3 font-medium transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
