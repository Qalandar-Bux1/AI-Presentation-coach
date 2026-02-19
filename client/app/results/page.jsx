"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../components/bg.css";
import { Loader2, AlertCircle, BarChart2, Video, Calendar, ArrowRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResultsIndexPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    const fetchAnalyzedSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view results");
          setLoading(false);
          window.location.href = "/";
          return;
        }

        const res = await fetch("http://localhost:5000/session/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Failed to fetch sessions");
        }

        const data = await res.json();
        const allSessions = data.sessions || [];
        
        // Filter only analyzed sessions
        const analyzedSessions = allSessions.filter(
          s => s.analysis_report || s.feedback
        ).sort(
          (a, b) => new Date(b.analyzed_at || b.created_at || 0) - new Date(a.analyzed_at || a.created_at || 0)
        );

        setSessions(analyzedSessions);
        
        // If there's at least one analyzed session, redirect to the latest one
        if (analyzedSessions.length > 0 && !redirected) {
          setRedirected(true);
          // Use window.location for more reliable navigation
          window.location.href = `/results/${analyzedSessions[0]._id}`;
          return;
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        if (err.message.includes("Failed to fetch") || err.message.includes("ERR_CONNECTION")) {
          setError("Cannot connect to backend server. Please ensure the Flask server is running on http://localhost:5000");
        } else {
          setError(err.message || "Failed to load analyzed sessions");
        }
        toast.error(err.message || "Failed to load analyzed sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyzedSessions();
  }, [redirected]);

  if (loading) {
    return (
      <div className="flex min-h-screen relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Loading analyzed sessions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-2xl p-8 max-w-md text-center shadow-glass">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.href = "/my-videos"}
                className="btn-gradient text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                Back to My Videos
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-screen relative overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-2xl p-8 max-w-md text-center shadow-glass">
              <BarChart2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No Results Yet</h2>
              <p className="text-slate-600 mb-6">You haven't analyzed any videos yet. Analyze a video to see results.</p>
              <button
                onClick={() => window.location.href = "/my-videos"}
                className="btn-gradient text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
              >
                Go to My Videos
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <ToastContainer />
      <Sidebar />
      
      <main className="flex-1 ml-64 p-10 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
            <h1 className="text-3xl font-bold text-slate-800">Analysis Results</h1>
          </div>
          <p className="text-slate-600 ml-16">Select a session to view detailed results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const score = session.analysis_report?.scores?.final_score || session.score || 0;
            const grade = session.analysis_report?.scores?.grade || session.grade || "N/A";
            const analyzedDate = session.analyzed_at || session.created_at;

            return (
              <div
                key={session._id}
                onClick={() => window.location.href = `/results/${session._id}`}
                className="glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 btn-gradient rounded-xl shadow-lg">
                    <Video className="text-white" size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gradient">{score.toFixed(1)}</p>
                    <p className="text-sm text-slate-500">/ 100</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-lg font-bold text-slate-800 mb-1">Grade: {grade}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} />
                    <span>{analyzedDate ? new Date(analyzedDate).toLocaleDateString() : "—"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-primary-600 font-medium">
                  <span>View Results</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
