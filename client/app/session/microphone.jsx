"use client";
import { useState } from "react";
import MicrophonePlus from "../components/MicrophonePlus";

export default function MicDemo() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] text-white">
      <MicrophonePlus isRecording={isRecording} />

      <button
        onClick={() => setIsRecording(!isRecording)}
        className={`mt-6 px-6 py-3 rounded-lg text-white transition-all ${
          isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}
