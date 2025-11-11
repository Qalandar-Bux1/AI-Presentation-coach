"use client";
import Sidebar from "../components/Sidebar";
import Profile from "../components/Profile";

export default function ProfilePage() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-56 p-10">
        <Profile />
      </main>
    </div>
  );
}
