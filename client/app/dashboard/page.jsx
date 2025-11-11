"use client";
import Sidebar from "../components/Sidebar";
import "../components/bg.css";
import { Upload, BarChart2, FileText, User2, LogOut } from "lucide-react";

export default function Dashboard() {

  const handleLogout = () => {
    localStorage.removeItem("token"); // if token stored
    window.location.href = "/";
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-56 p-10">
        
        {/* TOP Right Section with Logout */}
        <div className="flex justify-end w-full mb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-all shadow"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your presentation sessions and check performance anytime.
          </p>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

          {/* New Session */}
          <div className="bg-white shadow-sm border rounded-xl p-6 hover:shadow-md transition-all">
            <div className="flex gap-4 items-center mb-3">
              <Upload size={28} className="text-blue-600" />
              <p className="text-lg font-semibold text-gray-800">New Session</p>
            </div>
            <p className="text-gray-600 text-sm">Start a new session for presentation performance.</p>
            <button
              onClick={() => window.location.href = "/session"}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-all"
            >
              Start Now
            </button>
          </div>

          {/* Results Dashboard */}
          <div className="bg-white shadow-sm border rounded-xl p-6 hover:shadow-md transition-all">
            <div className="flex gap-4 items-center mb-3">
              <BarChart2 size={28} className="text-blue-600" />
              <p className="text-lg font-semibold text-gray-800">Results Dashboard</p>
            </div>
            <p className="text-gray-600 text-sm">
              View your performance scores and key insights quickly.
            </p>
            <button
              onClick={(e) => e.preventDefault()}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-all"
            >
              View Results
            </button>
          </div>

          {/* Feedback Report */}
          <div className="bg-white shadow-sm border rounded-xl p-6 hover:shadow-md transition-all">
            <div className="flex gap-4 items-center mb-3">
              <FileText size={28} className="text-blue-600" />
              <p className="text-lg font-semibold text-gray-800">Feedback Report</p>
            </div>
            <p className="text-gray-600 text-sm">Explore feedback and recommendations for improvement.</p>
            <button
              onClick={(e) => e.preventDefault()}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-all"
            >
              Open Report
            </button>
          </div>

          {/* Profile */}
          <div className="bg-white shadow-sm border rounded-xl p-6 hover:shadow-md transition-all">
            <div className="flex gap-4 items-center mb-3">
              <User2 size={28} className="text-blue-600" />
              <p className="text-lg font-semibold text-gray-800">Profile & Progress</p>
            </div>
            <p className="text-gray-600 text-sm">Track statistics and manage your account.</p>
            <button
              onClick={() => window.location.href = "/profile"}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-all"
            >
              View Profile
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}
