"use client";
import { useEffect, useState } from "react";

const Timer = ({ isRecording, isPaused, reset }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    // When reset changes to true, reset timer immediately
    if (reset) {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isRecording, isPaused, reset]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="text-4xl font-bold text-[#3ABDF8] tracking-widest bg-[#1E293B] px-6 py-2 rounded-lg shadow-md border border-[#334155]">
      {formatTime(seconds)}
    </div>
  );
};

export default Timer;
