'use client';

import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import "../components/bg.css";
import { useEffect, useState } from "react";
import Scores from "./scores";

export default function Analysis() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from backend
    const dummyReport = {
      scores: {
        vocabulary: 75,
        voice: 82,
        expressions: 68,
      },
      vocabulary_report: "Your vocabulary usage was rich and diverse.",
      speech_report: "Good control of tone and clarity, though a bit fast.",
      expression_report: "Facial expressions matched emotions fairly well.",
    };

    setTimeout(() => {
      setReport(dummyReport);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="flex static-bg">
      <div className="w-20 md:24">
        <Sidebar />
      </div>
      <div className="flex flex-col justify-center items-center w-full min-h-screen max-h-full p-4">
        <Scores report={report} />
      </div>
    </div>
  );
}
