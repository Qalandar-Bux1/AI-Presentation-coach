"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState({ username: "Guest User", email: "Not Available" });

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
    <div>
      <p className="text-gray-600 text-sm">User Details</p>
      <h2 className="text-xl font-semibold text-gray-800 mt-1">{user.username}</h2>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-gray-700 font-medium break-all">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-gray-700 font-medium">{user.role || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Student ID</p>
          <p className="text-gray-700 font-medium">{user.studentId || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Program</p>
          <p className="text-gray-700 font-medium">{user.program || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Semester</p>
          <p className="text-gray-700 font-medium">{user.semester || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="text-gray-700 font-medium">{user.phone || "—"}</p>
        </div>
      </div>
    </div>
  );
}
