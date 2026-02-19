"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../components/bg.css";
import { Upload, BarChart2, FileText, User2, Brain, Video, TrendingUp, Clock, Sparkles } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AnalysisProgress from "../components/AnalysisProgress";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:5000/session/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load videos");
      const list = (data.sessions || [])
        .filter(s => s.video_path && s.video_path.trim() !== "")
        .sort(
          (a, b) => new Date(b.start_time || 0) - new Date(a.start_time || 0)
        );
      setAllVideos(list);
      setVideos(list.slice(0, 2));
    } catch (e) {
      setError(e.message || "Error loading videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user details to get username
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch("http://localhost:5000/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.username) {
              setUsername(data.user.username);
              // Also update localStorage for consistency
              localStorage.setItem("username", data.user.username);
            }
          }
        }
      } catch (e) {
        console.error("Error fetching user:", e);
        // Fallback to localStorage if API fails
        const storedUsername = localStorage.getItem("username") || "";
        setUsername(storedUsername);
      }
    };

    fetchUser();
    fetchVideos();
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  const [analyzingSessions, setAnalyzingSessions] = useState(new Set());

  const handleAnalysis = async (sessionId, videoPath) => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        toast.error("Please log in to analyze videos");
        return;
      }

      // Check if already analyzing
      if (analyzingSessions.has(sessionId)) {
        toast.info("Analysis already in progress for this video");
        return;
      }

      // Check if already analyzed
      const session = allVideos.find(v => v._id === sessionId);
      if (session && (session.analysis_report || session.feedback)) {
        toast.info("This video has already been analyzed");
        return;
      }

      toast.info("Starting analysis... This may take a few minutes...");

      // Mark as analyzing
      setAnalyzingSessions(prev => new Set(prev).add(sessionId));

      const analysisUrl = `http://localhost:5000/session/${sessionId}/analyze`;

      try {
        const res = await fetch(analysisUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          const errorText = await res.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: `Server error: ${res.status} ${res.statusText}` };
          }
          throw new Error(errorData?.error || "Analysis failed");
        }

        const data = await res.json();

        if (data.success) {
          if (data.already_completed) {
            toast.success("Analysis already completed!");
            setAnalyzingSessions(prev => {
              const next = new Set(prev);
              next.delete(sessionId);
              return next;
            });
            fetchVideos();
          } else if (data.in_progress) {
            toast.info("Analysis already in progress");
            setAnalyzingSessions(prev => new Set(prev).add(sessionId));
          } else {
            toast.success("Analysis started! Progress will be shown below.");
            setAnalyzingSessions(prev => new Set(prev).add(sessionId));
            // Refresh videos to show progress component
            fetchVideos();
          }
        } else {
          throw new Error(data.error || "Failed to start analysis");
        }
      } catch (fetchError) {
        console.error("Analysis error:", fetchError);
        setAnalyzingSessions(prev => {
          const next = new Set(prev);
          next.delete(sessionId);
          return next;
        });
        if (fetchError.message.includes("Failed to fetch") || fetchError.message.includes("ERR_CONNECTION")) {
          toast.error("Cannot connect to backend. Please ensure Flask server is running on http://localhost:5000");
        } else {
          toast.error(fetchError.message || "Analysis failed. Please try again.");
        }
      }
    } catch (e) {
      console.error("Analysis error:", e);
      setAnalyzingSessions(prev => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
      toast.error(e.message || "Analysis failed");
    }
  };

  const handleAnalysisComplete = (sessionId) => {
    setAnalyzingSessions(prev => {
      const next = new Set(prev);
      next.delete(sessionId);
      return next;
    });
    fetchVideos();
  };

  return (
    <div className="flex min-h-screen">
      <ToastContainer />
      <Sidebar />

      <main className="flex-1 ml-64 p-6">
        {/* Hero Header */}
        <div className="glass rounded-2xl shadow-glass px-8 py-10 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-3 btn-gradient rounded-xl shadow-glass">
              <User2 size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Hello, {username || "User"}! 👋</h1>
              <p className="text-slate-600 text-sm">Your personal presentation coaching hub</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 btn-gradient rounded-xl shadow-sm">
                  <Video className="text-white" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={18} />
              </div>
              <p className="text-slate-600 text-xs font-medium mb-0.5">Total Videos</p>
              <p className="text-2xl font-bold text-slate-800">{allVideos.length}</p>
            </div>

            <div className="glass rounded-xl p-4 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 btn-gradient rounded-xl shadow-sm">
                  <Clock className="text-white" size={20} />
                </div>
                <Sparkles className="text-yellow-500" size={18} />
              </div>
              <p className="text-slate-600 text-xs font-medium mb-0.5">Recent Activity</p>
              <p className="text-lg font-bold text-slate-800">
                {allVideos?.[0]?.start_time ? new Date(allVideos[0].start_time).toLocaleDateString() : "—"}
              </p>
            </div>

            <div className="glass rounded-xl p-4 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 btn-gradient rounded-xl shadow-sm">
                  <Brain className="text-white" size={20} />
                </div>
                <BarChart2 className="text-blue-500" size={18} />
              </div>
              <p className="text-slate-600 text-xs font-medium mb-0.5">Ready for Analysis</p>
              <p className="text-2xl font-bold text-slate-800">{allVideos.filter(v => !v.feedback).length}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Session Card */}
            <div className="glass rounded-2xl p-5 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 btn-gradient rounded-xl mb-3 shadow-glass">
                  <Upload className="text-white" size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">New Presentation</h3>
                <p className="text-slate-600 text-xs mb-3">Start recording your presentation</p>
                <button
                  onClick={() => window.location.href = "/session"}
                  className="w-full btn-gradient text-white py-2 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
                >
                  Start Now
                </button>
              </div>
            </div>

            {/* Results Dashboard Card */}
            <div className="glass rounded-2xl p-5 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 btn-gradient rounded-xl mb-3 shadow-glass">
                  <BarChart2 className="text-white" size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Results</h3>
                <p className="text-slate-600 text-xs mb-3">View performance insights</p>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="w-full btn-gradient text-white py-2 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
                >
                  View Results
                </button>
              </div>
            </div>

            {/* Feedback Report Card */}
            <div className="glass rounded-2xl p-5 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 btn-gradient rounded-xl mb-3 shadow-glass">
                  <FileText className="text-white" size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Feedback</h3>
                <p className="text-slate-600 text-xs mb-3">Explore recommendations</p>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="w-full btn-gradient text-white py-2 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
                >
                  Open Report
                </button>
              </div>
            </div>

            {/* Profile Card */}
            <div className="glass rounded-2xl p-5 shadow-glass hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 btn-gradient rounded-xl mb-3 shadow-glass">
                  <User2 className="text-white" size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Profile</h3>
                <p className="text-slate-600 text-xs mb-3">Manage your account</p>
                <button
                  onClick={() => window.location.href = "/profile"}
                  className="w-full btn-gradient text-white py-2 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My Videos Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-800">Recent Videos</h2>
            <button
              onClick={() => (window.location.href = "/my-videos")}
              className="btn-gradient text-white py-2 px-5 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Video size={16} />
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-6 text-center shadow-glass border-2 border-red-200/40">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center shadow-glass">
              <div className="inline-flex p-4 btn-gradient rounded-2xl mb-4 shadow-glass">
                <Video className="text-white" size={40} />
              </div>
              <p className="text-slate-800 text-lg font-medium">No videos yet</p>
              <p className="text-slate-600 text-sm mt-2">Start a session to record your first video</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((v, idx) => {
                const fileName = v?.video_path ? String(v.video_path).split(/[\\/]/).pop() : "";
                const src = fileName ? `http://localhost:5000/uploads/${encodeURIComponent(fileName)}` : "";
                return (
                  <div key={idx} className="glass rounded-2xl overflow-hidden shadow-glass hover:shadow-xl transition-shadow">
                    <div className="relative w-full h-56 bg-black overflow-hidden">
                      {src ? (
                        <video
                          className="w-full h-full object-contain bg-black"
                          controls
                          playsInline
                          disablePictureInPicture
                          controlsList="nodownload noplaybackrate"
                          onError={() => console.warn("Video failed to load:", src)}
                        >
                          <source src={src} type={fileName?.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/webm"} />
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Video size={40} />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        {v?.start_time ? new Date(v.start_time).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{v?.start_time ? new Date(v.start_time).toLocaleTimeString() : "—"}</span>
                        </div>
                        {v.feedback && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-300">
                            Analyzed
                          </span>
                        )}
                      </div>
                      {/* Show progress if analyzing */}
                      {analyzingSessions.has(v._id) && (
                        <AnalysisProgress
                          sessionId={v._id}
                          onComplete={() => handleAnalysisComplete(v._id)}
                          onError={() => {
                            setAnalyzingSessions(prev => {
                              const next = new Set(prev);
                              next.delete(v._id);
                              return next;
                            });
                          }}
                        />
                      )}

                      <button
                        onClick={() => handleAnalysis(v._id, v.video_path)}
                        disabled={analyzingSessions.has(v._id) || (v.analysis_report || v.feedback)}
                        className={`w-full py-2 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${analyzingSessions.has(v._id) || (v.analysis_report || v.feedback)
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "btn-gradient text-white"
                          }`}
                      >
                        <Brain size={16} />
                        {analyzingSessions.has(v._id) ? "Analyzing..." : (v.analysis_report || v.feedback) ? "Already Analyzed" : "Analyze Video"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
