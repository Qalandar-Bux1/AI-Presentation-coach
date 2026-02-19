"use client";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { Video, Upload, Sparkles, ArrowRight } from "lucide-react";

export default function SessionChoice() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col items-center justify-center ml-64 px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 btn-gradient rounded-xl shadow-glass">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gradient">
              Start a New Presentation
            </h1>
          </div>
          <p className="text-slate-600 text-sm max-w-2xl">
            Choose how you'd like to begin your presentation coaching session
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl">
          {/* Record Video Card */}
          <Link
            href="/session/record"
            className="group flex-1 glass rounded-2xl shadow-glass hover:shadow-xl transition-all duration-300 p-6"
          >
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="p-3 btn-gradient rounded-xl mb-4 transition-all duration-300 shadow-glass">
                <Video className="text-white" size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Record Video</h3>
              <p className="text-slate-600 text-sm mb-4 max-w-xs">
                Record a new presentation using your camera and microphone
              </p>
              <div className="flex items-center gap-2 text-slate-700 font-medium group-hover:gap-4 transition-all">
                <span>Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Upload Video Card */}
          <Link
            href="/session/upload"
            className="group flex-1 glass rounded-2xl shadow-glass hover:shadow-xl transition-all duration-300 p-6"
          >
            <div className="flex flex-col items-center text-center h-full justify-center">
              <div className="p-3 btn-gradient rounded-xl mb-4 transition-all duration-300 shadow-glass">
                <Upload className="text-white" size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">Upload Video</h3>
              <p className="text-slate-600 text-sm mb-4 max-w-xs">
                Upload an existing video file for AI-powered analysis
              </p>
              <div className="flex items-center gap-2 text-slate-700 font-medium group-hover:gap-4 transition-all">
                <span>Upload Now</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-xl shadow-glass">
            <Sparkles size={18} className="text-yellow-500" />
            <p className="text-slate-600 text-sm">
              Both options support AI-powered feedback and analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
