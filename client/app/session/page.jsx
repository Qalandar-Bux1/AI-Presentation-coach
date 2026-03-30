"use client";

import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { Video, Upload, Camera } from "lucide-react";

export default function SessionPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 pb-8">
        <div className="rounded-b-[28px] px-8 lg:px-10 py-10 text-white relative overflow-hidden" style={{ background: "linear-gradient(145deg, #113a4b 0%, #061824 100%)" }}>
          <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-sky-300/15 blur-3xl" />
          <div className="relative max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[11px] uppercase tracking-wider text-slate-200 mb-4">
              Presentation Hub
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-3">Start Your AI Coaching Session</h1>
            <p className="text-slate-200 max-w-2xl">
              Record or upload a presentation video and get instant AI-powered analysis on tone, eye contact, body language, and more.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10">Private & Secure</span>
              <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10">Detailed Score Report</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 lg:px-10 -mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push("/session/record")}
              className="glass rounded-2xl p-7 text-left hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-slate-100"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-ai flex items-center justify-center mb-4">
                <Camera className="text-white" size={22} />
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Record</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Record Video
              </h2>
              <p className="text-slate-600 text-sm leading-6 mb-4">
                Use your camera and microphone to record a live presentation. Get instant feedback as soon as you're done.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 mb-5">
                <li>• Use your webcam</li>
                <li>• Real-time recording</li>
                <li>• Instant AI analysis</li>
              </ul>
              <div className="w-full btn-gradient text-white rounded-lg py-2.5 text-sm font-semibold text-center">Start Recording</div>
            </button>

            <button
              onClick={() => router.push("/session/upload")}
              className="glass rounded-2xl p-7 text-left hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-slate-100"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-ai flex items-center justify-center mb-4">
                <Upload className="text-white" size={22} />
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">File</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Upload Video
              </h2>
              <p className="text-slate-600 text-sm leading-6 mb-4">
                Upload an existing presentation video from your device for a full AI coaching review.
              </p>
              <ul className="text-xs text-slate-500 space-y-1 mb-5">
                <li>• Supports MP4 and WebM</li>
                <li>• Up to 100MB</li>
                <li>• Full analysis report</li>
              </ul>
              <div className="w-full btn-gradient text-white rounded-lg py-2.5 text-sm font-semibold text-center">Upload Now</div>
            </button>
          </div>

          <div className="glass rounded-xl px-4 py-3 text-xs text-slate-600 text-center mt-4">
            Both options include <span className="font-semibold text-slate-800">full AI analysis</span> - tone, eye contact, body language, confidence, and a detailed score report.
          </div>
        </div>
      </main>
    </div>
  );
}
