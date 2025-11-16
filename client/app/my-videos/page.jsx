"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Trash2, Download, Loader2, Upload, Video, Calendar, Clock } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Video Player Component with Close Button
const VideoPlayer = ({ src, fileName }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const video = document.getElementById(`video-${src}`);
    if (!video) return;
    
    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="relative w-full h-56 sm:h-64 rounded-t-2xl overflow-hidden bg-black group">
      <video
        id={`video-${src}`}
        className="w-full h-full object-contain bg-black"
        controls
        playsInline
        preload="metadata"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        onError={(e) => {
          console.warn("Video failed to load:", src);
          toast.error("Video file not found on server");
        }}
      >
        <source src={src} type={fileName?.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/webm"} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default function MyVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        setError("Please log in to view your videos");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/session/all", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Failed to load videos";
        try {
          const data = JSON.parse(text);
          errorMsg = data?.error || errorMsg;
        } catch {
          errorMsg = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const list = (data.sessions || [])
        .filter(s => s.video_path && s.video_path.trim() !== "")
        .sort(
        (a, b) => new Date(b.start_time || 0) - new Date(a.start_time || 0)
      );
      setVideos(list);
      setError("");
    } catch (e) {
      console.error("Error fetching videos:", e);
      if (e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:5000");
      } else {
        setError(e.message || "Failed to load videos");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (sessionId, videoName) => {
    if (!confirm(`Are you sure you want to delete "${videoName || "this video"}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:5000/session/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete video");
      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (e) {
      toast.error(e.message || "Failed to delete video");
    }
  };

  const handleDownload = async (videoPath, videoName) => {
    try {
      const fileName = videoPath ? String(videoPath).split(/[\\/]/).pop() : "video";
      const downloadUrl = `http://localhost:5000/uploads/${encodeURIComponent(fileName)}`;
      
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to download video");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = videoName || fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (e) {
      console.error("Download error:", e);
      toast.error("Failed to download video");
    }
  };

  const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
  const current = videos.slice((page - 1) * pageSize, page * pageSize);

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

      <Sidebar />
      <main className="flex-1 ml-64 p-10 relative z-10">
        <ToastContainer />
        
        {/* Header Section with Gradient Background */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 rounded-3xl p-8 mb-8 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 3px 3px, white 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                <Video size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  My Videos
                </h1>
                <p className="text-white/90 text-base">Manage and review all your recorded presentations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Video className="text-white" size={24} />
              </div>
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white/70 text-sm font-medium mb-1">Total Videos</p>
            <p className="text-3xl font-bold text-white">{videos.length}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
              <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white/70 text-sm font-medium mb-1">This Month</p>
            <p className="text-3xl font-bold text-white">
              {videos.filter(v => {
                const videoDate = new Date(v.start_time);
                const now = new Date();
                return videoDate.getMonth() === now.getMonth() && videoDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white/70 text-sm font-medium mb-1">Recent</p>
            <p className="text-2xl font-bold text-white">
              {videos.length > 0 ? new Date(videos[0].start_time).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400 mx-auto mb-4"></div>
              <p className="text-white/70">Loading your videos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-xl border-2 border-red-300/50 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/30 rounded-xl">
                <Video className="text-red-200" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-red-200 font-bold text-lg mb-2">Error Loading Videos</p>
                <p className="text-red-300 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError("");
                    setLoading(true);
                    fetchVideos();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Loader2 size={18} className="animate-spin" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-16 text-center">
            <div className="inline-flex p-6 bg-white/20 rounded-full mb-6">
              <Video className="text-white" size={64} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Videos Yet</h3>
            <p className="text-white/70 mb-6">Start recording to create your first presentation video</p>
            <button
              onClick={() => (window.location.href = "/session")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Start Recording
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {current.map((v) => {
                const fileName = v?.video_path ? String(v.video_path).split(/[\\/]/).pop() : "";
                const src = fileName ? `http://localhost:5000/uploads/${encodeURIComponent(fileName)}` : "";
                const videoName = fileName || `Video ${v._id?.slice(-6) || ""}`;
                
                return (
                  <div key={v._id || Math.random()} className="group bg-white/15 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]">
                    {/* Video Player */}
                    <div className="relative">
                      {src ? (
                        <VideoPlayer src={src} fileName={fileName} />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                          <Video className="text-gray-400" size={48} />
                        </div>
                      )}
                      {v.feedback && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ✓ Analyzed
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-white/70 mb-4">
                        <Calendar size={14} />
                        <span>{v?.start_time ? new Date(v.start_time).toLocaleDateString() : "—"}</span>
                        <span className="mx-1">•</span>
                        <Clock size={14} />
                        <span>{v?.start_time ? new Date(v.start_time).toLocaleTimeString() : "—"}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleDownload(v.video_path, videoName)}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105"
                          title="Download video"
                        >
                          <Download size={18} />
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(v._id, videoName)}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
                          title="Delete video"
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {videos.length > pageSize && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2.5 rounded-xl border-2 border-white/30 text-sm font-medium bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        page === i + 1
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2.5 rounded-xl border-2 border-white/30 text-sm font-medium bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
