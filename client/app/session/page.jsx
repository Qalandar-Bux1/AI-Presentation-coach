"use client";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { Video, Upload, Sparkles, ArrowRight } from "lucide-react";

export default function SessionChoice() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Animated Background Pattern - matches landing page */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0, 217, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient Orbs - matches landing page */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-ai-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-ai-purple rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col items-center justify-center ml-64 relative z-10 px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 btn-gradient rounded-2xl shadow-lg">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-bold text-gradient">
              Start a New Session
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl">
            Choose how you'd like to begin your presentation coaching session
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-4xl">
          {/* Record Video Card */}
          <Link
            href="/session/record"
            className="group flex-1 relative overflow-hidden glass rounded-3xl p-8 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
          >
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
              <div className="p-6 btn-gradient rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Video className="text-white" size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Record Video</h3>
              <p className="text-slate-600 text-sm mb-6 max-w-xs">
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
            className="group flex-1 relative overflow-hidden glass rounded-3xl p-8 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
          >
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
              <div className="p-6 btn-gradient rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Upload className="text-white" size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Upload Video</h3>
              <p className="text-slate-600 text-sm mb-6 max-w-xs">
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
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full shadow-glass">
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
