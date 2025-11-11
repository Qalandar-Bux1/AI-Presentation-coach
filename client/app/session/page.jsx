"use client";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { Video, Upload } from "lucide-react";

export default function SessionChoice() {
  return (
    <div className="flex min-h-screen bg-[#0F172A] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col items-center justify-center ml-56">
        <h1 className="text-4xl font-bold mb-12">Start a New Session</h1>

        <div className="flex flex-col sm:flex-row gap-10">
          {/* Record Card */}
          <Link
            href="/session/record"
            className="w-64 h-48 bg-gradient-to-br from-[#3ABDF8] to-[#818CF8] rounded-2xl flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Video size={48} />
            <p className="mt-4 text-xl font-semibold">Record Video</p>
          </Link>

          {/* Upload Card */}
          <Link
            href="/session/upload"
            className="w-64 h-48 bg-gradient-to-br from-[#FB7085] to-[#FFA07A] rounded-2xl flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Upload size={48} />
            <p className="mt-4 text-xl font-semibold">Upload Video</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
