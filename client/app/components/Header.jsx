"use client";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function Header({ userName = "User" }) {
  return (
    <header className="flex justify-between items-center w-full px-6 py-4 bg-white shadow-sm rounded-xl mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Hi, {userName} 👋
        </h2>
        <p className="text-gray-500 text-sm">
          Welcome back to your AI Presentation Coach!
        </p>
      </div>
      <div className="flex items-center gap-4">
        <UserCircleIcon className="w-10 h-10 text-blue-600 cursor-pointer" />
      </div>
    </header>
  );
}
