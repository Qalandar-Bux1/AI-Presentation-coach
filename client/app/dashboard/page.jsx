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
    <div className="flex bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 min-h-screen relative overflow-hidden">
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

      <ToastContainer />
      <Sidebar />

      <main className="flex-1 ml-64 p-0 relative z-10">
        {/* Modern Hero Header with Animated Gradient */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white px-10 py-16 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 3px 3px, white 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                <User2 size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Hello, {username || "User"}! 👋</h1>
                <p className="text-white/90 text-base">Your personal presentation coaching hub</p>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Video className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-green-300" size={20} />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Total Videos</p>
                <p className="text-3xl font-bold">{allVideos.length}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Clock className="text-white" size={24} />
                  </div>
                  <Sparkles className="text-yellow-300" size={20} />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Recent Activity</p>
                <p className="text-2xl font-bold">
                  {allVideos?.[0]?.start_time ? new Date(allVideos[0].start_time).toLocaleDateString() : "—"}
                </p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Brain className="text-white" size={24} />
                  </div>
                  <BarChart2 className="text-blue-300" size={20} />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Ready for Analysis</p>
                <p className="text-3xl font-bold">{allVideos.filter(v => !v.feedback).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* Quick Actions with Modern Cards */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* New Session Card */}
              <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-indigo-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">New Session</h3>
                  <p className="text-white/70 text-sm mb-4">Start recording your presentation</p>
                  <button
                    onClick={() => window.location.href = "/session"}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Start Now
                  </button>
                </div>
              </div>

              {/* Results Dashboard Card */}
              <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-purple-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <BarChart2 className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Results</h3>
                  <p className="text-white/70 text-sm mb-4">View performance insights</p>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    View Results
                  </button>
                </div>
              </div>

              {/* Feedback Report Card */}
              <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-green-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Feedback</h3>
                  <p className="text-white/70 text-sm mb-4">Explore recommendations</p>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Open Report
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-orange-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <User2 className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Profile</h3>
                  <p className="text-white/70 text-sm mb-4">Manage your account</p>
                  <button
                    onClick={() => window.location.href = "/profile"}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
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
                <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Recent Videos</h2>
              </div>
              <button
                onClick={() => (window.location.href = "/my-videos")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 px-6 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Video size={18} />
                View All
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/50 rounded-xl p-6 text-center">
                <p className="text-red-200">{error}</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center shadow-lg border border-white/20">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                  <Video className="text-white" size={48} />
                </div>
                <p className="text-white text-lg font-medium">No videos yet</p>
                <p className="text-white/70 text-sm mt-2">Start a session to record your first video</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {videos.map((v, idx) => {
                  const fileName = v?.video_path ? String(v.video_path).split(/[\\/]/).pop() : "";
                  const src = fileName ? `http://localhost:5000/uploads/${encodeURIComponent(fileName)}` : "";
                  return (
                    <div key={idx} className="group bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
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
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          {v?.start_time ? new Date(v.start_time).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between text-xs text-white/70 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{v?.start_time ? new Date(v.start_time).toLocaleTimeString() : "—"}</span>
                          </div>
                          {v.feedback && (
                            <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded-full text-xs font-medium border border-green-400/50">
                              Analyzed
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAnalysis(v._id, v.video_path)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
