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
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching report (frontend-only demo)
    const fetchReport = () => {
      try {
        // Read report from query params (if user clicked a table row)
        const queryParams = new URLSearchParams(window.location.search);
        const reportFromQuery = queryParams.get("report");

        if (reportFromQuery) {
          const parsedReport = JSON.parse(decodeURIComponent(reportFromQuery));
          setReport(parsedReport);
        } else {
          // Dummy data if no query found (for direct dashboard access)
          const dummyReport = {
            _id: "demo123",
            title: "AI Presentation Rehearsal",
            scores: {
              voice: 90,
              expressions: 82,
              vocabulary: 87,
              overall: 86,
            },
            feedback: {
              voice: "Strong, confident delivery. Work on varying tone slightly.",
              expressions: "Good hand gestures. Try to keep consistent eye contact.",
              vocabulary: "Excellent choice of words and professional phrasing.",
            },
            date: "2025-10-27",
          };
          setReport(dummyReport);
        }
      } catch (err) {
        setError("Error loading report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!report) {
    return <div className="text-center text-white">No report found.</div>;
  }

  return (
    <div className="flex static-bg">
      <div className="w-20 md:24">
        <Sidebar />
      </div>
      <div className="flex flex-col justify-center items-center w-full min-h-screen max-h-full p-4">
        <h2 className="text-white text-2xl font-semibold mb-6">
          {report.title}
        </h2>
        <Scores report={report} />
        <div className="mt-8 text-white text-sm bg-[#1E293B] p-4 rounded-lg border border-slate-700 max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Feedback</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Voice:</strong> {report.feedback.voice}</li>
            <li><strong>Body Language:</strong> {report.feedback.expressions}</li>
            <li><strong>Vocabulary:</strong> {report.feedback.vocabulary}</li>
          </ul>
          <p className="mt-2 text-gray-400 text-xs">Session Date: {report.date}</p>
        </div>
      </div>
    </div>
  );
}
