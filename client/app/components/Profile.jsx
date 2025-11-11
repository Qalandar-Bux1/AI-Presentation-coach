"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState({ name: "Guest User", email: "Not Available" });

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Change method to GET (your backend likely allows only GET)
        const res = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Correct way to send JWT
          },
        });

        // ✅ Check for non-JSON error responses
        const text = await res.text();
        try {
          const data = JSON.parse(text);

          if (data.success) {
            setUser(data.user);
          } else {
            console.error(data.error);
          }
        } catch {
          console.error("Server did not return JSON:", text);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="ml-56 p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>

      <div className="mt-10 bg-white rounded-lg shadow p-6 w-full max-w-lg">
        <p className="text-gray-600 text-sm">User Details</p>
        <h2 className="text-xl font-semibold text-gray-800 mt-1">{user.username}</h2>

        <div className="mt-4">
          <p className="text-sm text-gray-500">Email Address</p>
          <p className="text-gray-700 font-medium">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
