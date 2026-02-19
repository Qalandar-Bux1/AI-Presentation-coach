"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Trash2, Download, Loader2, Upload, Video, Calendar, Clock, BarChart2, FileText, Brain } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AnalysisProgress from "../components/AnalysisProgress";

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
    <div className="relative w-full h-56 sm:h-56 rounded-t-2xl overflow-hidden bg-black group">
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
  const [analyzingSessions, setAnalyzingSessions] = useState(new Set());
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

  // Check for videos with processing status on mount and after fetching
  useEffect(() => {
    const processingVideos = videos.filter(
      v => v.analysis_status === "processing"
    );
    
    if (processingVideos.length > 0) {
      setAnalyzingSessions(prev => {
        const updated = new Set(prev);
        processingVideos.forEach(v => updated.add(v._id));
        return updated;
      });
    }
  }, [videos]);

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
      if (!videoPath) {
        toast.error("No video file path available");
        return;
      }

      // Use the original filename from the path
      const fileName = String(videoPath).split(/[\\/]/).pop();
      // Construct the static download URL directly
      const downloadUrl = `http://localhost:5000/uploads/${encodeURIComponent(fileName)}`;

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Use original extension or default to .mp4 if missing
      const extension = fileName.includes('.') ? fileName.split('.').pop() : 'mp4';
      link.download = videoName ? `${videoName}.${extension}` : fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (e) {
      console.error("Download error:", e);
      toast.error("Failed to download video.");
    }
  };

  const handleAnalysis = async (sessionId) => {
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

      // Check if already analyzed or processing
      const session = videos.find(v => v._id === sessionId);
      const analysisStatus = session?.analysis_status || "not_started";
      if (analysisStatus === "completed" || analysisStatus === "completed_with_warning") {
        toast.info("This video has already been analyzed");
        return;
      }
      if (analysisStatus === "processing") {
        toast.info("Analysis is already in progress for this video");
        return;
      }
      if (analysisStatus === "failed") {
        const errorMsg = session?.analysis_error || "Unknown error";
        if (errorMsg.toLowerCase().includes("too short") || errorMsg.toLowerCase().includes("minimum")) {
          toast.error("❌ Video is too short. Minimum presentation length is 10 seconds.");
        } else {
          toast.error(`Analysis failed: ${errorMsg}`);
        }
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

          // Handle video too short error
          if (errorData?.video_too_short || (errorData?.error && errorData.error.toLowerCase().includes("too short"))) {
            const errorMsg = errorData.error || "Video is too short. Minimum presentation length is 10 seconds.";
            toast.error(`❌ ${errorMsg}`);
            // Refresh videos to update status
            fetchVideos();
            throw new Error(errorMsg);
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
            fetchVideos();
          }
        } else {
          // Handle video too short or other errors
          if (data.video_too_short || (data.error && data.error.toLowerCase().includes("too short"))) {
            const errorMsg = data.error || "Video is too short. Minimum presentation length is 10 seconds.";
            toast.error(`❌ ${errorMsg}`);
            fetchVideos(); // Refresh to update status
          }
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

  const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
  const current = videos.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <ToastContainer />

        {/* Header Section */}
        <div className="glass rounded-2xl shadow-glass px-8 py-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 btn-gradient rounded-xl shadow-glass">
              <Video size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                My Videos
              </h1>
              <p className="text-slate-600 text-sm">Manage and review all your recorded presentations</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4 shadow-glass hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 btn-gradient rounded-xl shadow-sm">
                <Video className="text-white" size={20} />
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-slate-600 text-xs font-medium mb-0.5">Total Videos</p>
            <p className="text-2xl font-bold text-slate-800">{videos.length}</p>
          </div>
          <div className="glass rounded-xl p-4 shadow-glass hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 btn-gradient rounded-xl shadow-sm">
                <Calendar className="text-white" size={20} />
              </div>
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-slate-600 text-xs font-medium mb-0.5">This Month</p>
            <p className="text-2xl font-bold text-slate-800">
              {videos.filter(v => {
                const videoDate = new Date(v.start_time);
                const now = new Date();
                return videoDate.getMonth() === now.getMonth() && videoDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="glass rounded-xl p-4 shadow-glass hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 btn-gradient rounded-xl shadow-sm">
                <Clock className="text-white" size={20} />
              </div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-slate-600 text-xs font-medium mb-0.5">Recent</p>
            <p className="text-lg font-bold text-slate-800">
              {videos.length > 0 ? new Date(videos[0].start_time).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your videos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-8 shadow-glass border-2 border-red-200/40">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Video className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-red-600 font-bold text-lg mb-2">Error Loading Videos</p>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError("");
                    setLoading(true);
                    fetchVideos();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-shadow shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="glass rounded-2xl shadow-glass p-16 text-center">
            <div className="inline-flex p-6 btn-gradient rounded-2xl mb-6 shadow-glass">
              <Video className="text-white" size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Videos Yet</h3>
            <p className="text-slate-600 mb-6">Start recording to create your first presentation video</p>
            <button
              onClick={() => (window.location.href = "/session")}
              className="btn-gradient text-white px-8 py-3 rounded-xl font-medium transition-shadow shadow-sm hover:shadow-md"
            >
              Start Recording
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {current.map((v) => {
                const fileName = v?.video_path ? String(v.video_path).split(/[\\/]/).pop() : "";
                const src = fileName ? `http://localhost:5000/uploads/${encodeURIComponent(fileName)}` : "";
                const videoTitle = v?.title || (v?.start_time ? `Untitled Video – ${new Date(v.start_time).toLocaleDateString()}` : `Video ${v._id?.slice(-6) || ""}`);

                return (
                  <div key={v._id || Math.random()} className="glass rounded-2xl overflow-hidden shadow-glass hover:shadow-xl transition-shadow">
                    {/* Video Player */}
                    <div className="relative">
                      {src ? (
                        <VideoPlayer src={src} fileName={fileName} />
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center bg-gray-100">
                          <Video className="text-gray-400" size={40} />
                        </div>
                      )}
                      {(v.analysis_status === "completed" || v.analysis_status === "completed_with_warning") && (
                        <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border border-green-300">
                          ✓ Analyzed
                        </div>
                      )}
                      {v.analysis_status === "processing" && (
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-300 flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" />
                          Analyzing
                        </div>
                      )}
                      {v.analysis_status === "failed" && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border border-red-300">
                          ✗ Failed
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="text-base font-bold text-slate-800 mb-2">{videoTitle}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                        <Calendar size={13} />
                        <span>{v?.start_time ? new Date(v.start_time).toLocaleDateString() : "—"}</span>
                        <span className="mx-1">•</span>
                        <Clock size={13} />
                        <span>{v?.start_time ? new Date(v.start_time).toLocaleTimeString() : "—"}</span>
                      </div>

                      {/* Analysis Progress */}
                      {(analyzingSessions.has(v._id) || v.analysis_status === "processing") && (
                        <div className="mb-3">
                          <AnalysisProgress
                            sessionId={v._id}
                            onComplete={() => handleAnalysisComplete(v._id)}
                            onError={(error) => {
                              setAnalyzingSessions(prev => {
                                const next = new Set(prev);
                                next.delete(v._id);
                                return next;
                              });
                              fetchVideos();
                            }}
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      {(v.analysis_status === "completed" || v.analysis_status === "completed_with_warning") ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => window.location.href = `/results/${v._id}`}
                              className="flex items-center justify-center gap-1.5 btn-gradient text-white py-2 px-3 rounded-lg text-xs font-semibold transition-shadow shadow-sm hover:shadow-md"
                              title="View results"
                            >
                              <BarChart2 size={16} />
                              Results
                            </button>
                            <button
                              onClick={() => window.location.href = `/reports/${v._id}`}
                              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-shadow shadow-sm hover:shadow-md"
                              title="View report"
                            >
                              <FileText size={16} />
                              Report
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDownload(v.video_path, videoTitle)}
                              className="flex items-center justify-center gap-1.5 bg-white text-slate-700 py-2 px-3 rounded-lg text-xs font-medium transition-shadow shadow-sm hover:shadow-md border border-slate-200"
                              title="Download video"
                            >
                              <Download size={14} />
                              Download
                            </button>
                            <button
                              onClick={() => handleDelete(v._id, videoTitle)}
                              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-lg text-xs font-medium transition-shadow shadow-sm hover:shadow-md"
                              title="Delete video"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAnalysis(v._id)}
                            disabled={analyzingSessions.has(v._id) || v.analysis_status === "processing" || v.analysis_status === "failed"}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-shadow shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 ${analyzingSessions.has(v._id) || v.analysis_status === "processing" || v.analysis_status === "failed"
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "btn-gradient text-white"
                              }`}
                            title={v.analysis_status === "failed" ? "Analysis failed - video is too short or invalid" : "Analyze video"}
                          >
                            <Brain size={16} />
                            {analyzingSessions.has(v._id) || v.analysis_status === "processing" ? "Analyzing..." : (v.analysis_status === "failed" ? "Analysis Failed" : "Analyze Video")}
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleDownload(v.video_path, videoTitle)}
                              className="flex items-center justify-center gap-1.5 bg-white text-slate-700 py-2 px-3 rounded-lg text-xs font-medium transition-shadow shadow-sm hover:shadow-md border border-slate-200"
                              title="Download video"
                            >
                              <Download size={14} />
                              Download
                            </button>
                            <button
                              onClick={() => handleDelete(v._id, videoTitle)}
                              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-lg text-xs font-medium transition-shadow shadow-sm hover:shadow-md"
                              title="Delete video"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {videos.length > pageSize && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 rounded-xl glass shadow-glass text-sm font-medium hover:shadow-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-shadow ${page === i + 1
                        ? "btn-gradient text-white shadow-md"
                        : "glass shadow-glass text-slate-700 hover:shadow-xl"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2 rounded-xl glass shadow-glass text-sm font-medium hover:shadow-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
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
