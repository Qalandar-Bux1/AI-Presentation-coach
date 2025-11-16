"use client";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import { Video, Upload, Sparkles, ArrowRight } from "lucide-react";

export default function SessionChoice() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col items-center justify-center ml-64 relative z-10 px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <Sparkles className="text-yellow-300" size={32} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Start a New Session
            </h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">
            Choose how you'd like to begin your presentation coaching session
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-4xl">
          {/* Record Video Card */}
          <Link
            href="/session/record"
            className="group flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
              <div className="p-6 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <Video className="text-white" size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Record Video</h3>
              <p className="text-white/80 text-sm mb-6 max-w-xs">
                Record a new presentation using your camera and microphone
              </p>
              <div className="flex items-center gap-2 text-white/90 font-medium group-hover:gap-4 transition-all">
                <span>Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          </Link>

          {/* Upload Video Card */}
          <Link
            href="/session/upload"
            className="group flex-1 relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-600 to-red-600 rounded-3xl p-8 shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
              <div className="p-6 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <Upload className="text-white" size={64} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload Video</h3>
              <p className="text-white/80 text-sm mb-6 max-w-xs">
                Upload an existing video file for AI-powered analysis
              </p>
              <div className="flex items-center gap-2 text-white/90 font-medium group-hover:gap-4 transition-all">
                <span>Upload Now</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
            <Sparkles size={18} className="text-yellow-300" />
            <p className="text-white/80 text-sm">
              Both options support AI-powered feedback and analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
