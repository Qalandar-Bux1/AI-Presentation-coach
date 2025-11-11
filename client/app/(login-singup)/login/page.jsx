"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }
    );

    const json = await response.json();

    if (json.token) {
      localStorage.setItem("token", json.token);
      localStorage.setItem("username", json.username);
      localStorage.setItem("userId", json.userId);

      router.push("/dashboard");
    } else {
      alert(json.error || "Invalid credentials");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-blue-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Welcome Back 👋
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-gray-700 text-sm font-medium mb-2 block"
            >
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
            <label
              htmlFor="password"
              className="text-gray-700 text-sm font-medium mb-2 block"
            >
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

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-3 font-medium transition"
          >
            Login
          </button>

          <p className="text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-blue-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
