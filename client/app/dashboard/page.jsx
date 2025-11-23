"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../components/bg.css";
import { Upload, BarChart2, FileText, User2, Brain, Video, TrendingUp, Clock, Sparkles } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const handleAnalysis = async (sessionId, videoPath) => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        toast.error("Please log in to analyze videos");
        return;
      }

      toast.info("Starting analysis...");
      
      const fileName = videoPath ? String(videoPath).split(/[\\/]/).pop() : "";
      const analysisUrl = `http://localhost:5000/session/${sessionId}/analyze`;
      
      const res = await fetch(analysisUrl, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ video_path: fileName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Analysis failed");
      }

      toast.success("Analysis complete! Check feedback in video details.");
      fetchVideos();
    } catch (e) {
      console.error("Analysis error:", e);
      if (e.message.includes("404") || e.message.includes("Failed to fetch")) {
        toast.info("Analysis feature coming soon. This will analyze your video automatically.");
      } else {
        toast.error(e.message || "Analysis failed");
      }
    }
  };

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

      <ToastContainer />
      <Sidebar />

      <main className="flex-1 ml-64 p-0 relative z-10">
        {/* Modern Hero Header with Glass Effect */}
        <div className="relative glass rounded-3xl mx-10 mt-10 mb-10 px-10 py-16 overflow-hidden shadow-glass">
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 btn-gradient rounded-2xl shadow-lg">
                <User2 size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 text-slate-800">Hello, {username || "User"}! 👋</h1>
                <p className="text-slate-600 text-base">Your personal presentation coaching hub</p>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 btn-gradient rounded-xl shadow-lg">
                    <Video className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Videos</p>
                <p className="text-3xl font-bold text-slate-800">{allVideos.length}</p>
              </div>
              
              <div className="glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 btn-gradient rounded-xl shadow-lg">
                    <Clock className="text-white" size={24} />
                  </div>
                  <Sparkles className="text-yellow-500" size={20} />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">Recent Activity</p>
                <p className="text-2xl font-bold text-slate-800">
                  {allVideos?.[0]?.start_time ? new Date(allVideos[0].start_time).toLocaleDateString() : "—"}
                </p>
              </div>
              
              <div className="glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 btn-gradient rounded-xl shadow-lg">
                    <Brain className="text-white" size={24} />
                  </div>
                  <BarChart2 className="text-blue-500" size={20} />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">Ready for Analysis</p>
                <p className="text-3xl font-bold text-slate-800">{allVideos.filter(v => !v.feedback).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* Quick Actions with Modern Cards */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* New Session Card */}
              <div className="group glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 btn-gradient rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Upload className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">New Session</h3>
                  <p className="text-slate-600 text-sm mb-4">Start recording your presentation</p>
                  <button
                    onClick={() => window.location.href = "/session"}
                    className="w-full btn-gradient text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Start Now
                  </button>
                </div>
              </div>

              {/* Results Dashboard Card */}
              <div className="group glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 btn-gradient rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart2 className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Results</h3>
                  <p className="text-slate-600 text-sm mb-4">View performance insights</p>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-full btn-gradient text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    View Results
                  </button>
                </div>
              </div>

              {/* Feedback Report Card */}
              <div className="group glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 btn-gradient rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <FileText className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Feedback</h3>
                  <p className="text-slate-600 text-sm mb-4">Explore recommendations</p>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-full btn-gradient text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Open Report
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="group glass rounded-2xl p-6 shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 btn-gradient rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <User2 className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Profile</h3>
                  <p className="text-slate-600 text-sm mb-4">Manage your account</p>
                  <button
                    onClick={() => window.location.href = "/profile"}
                    className="w-full btn-gradient text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* My Videos Section with Modern Design */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-ai rounded-full"></div>
                <h2 className="text-2xl font-bold text-slate-800">Recent Videos</h2>
              </div>
              <button
                onClick={() => (window.location.href = "/my-videos")}
                className="btn-gradient text-white py-2.5 px-6 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Video size={18} />
                View All
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="glass border-2 border-red-300/50 rounded-xl p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center shadow-glass">
                <div className="inline-flex p-4 btn-gradient rounded-full mb-4 shadow-lg">
                  <Video className="text-white" size={48} />
                </div>
                <p className="text-slate-800 text-lg font-medium">No videos yet</p>
                <p className="text-slate-600 text-sm mt-2">Start a session to record your first video</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {videos.map((v, idx) => {
                  const fileName = v?.video_path ? String(v.video_path).split(/[\\/]/).pop() : "";
                  const src = fileName ? `http://localhost:5000/uploads/${encodeURIComponent(fileName)}` : "";
                  return (
                    <div key={idx} className="group glass rounded-2xl overflow-hidden shadow-glass hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="relative w-full h-64 bg-black overflow-hidden">
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
                            <Video size={48} />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          {v?.start_time ? new Date(v.start_time).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{v?.start_time ? new Date(v.start_time).toLocaleTimeString() : "—"}</span>
                          </div>
                          {v.feedback && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-300">
                              Analyzed
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAnalysis(v._id, v.video_path)}
                          className="w-full btn-gradient text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Brain size={18} />
                          Analyze Video
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
