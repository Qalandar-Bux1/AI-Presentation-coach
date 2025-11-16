"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Upload, X, FileVideo, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);

  const openPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const isMp4 = selected.type === "video/mp4";
      const isUnder50MB = selected.size <= 50 * 1024 * 1024;
      if (!isMp4) {
        toast.error("Only MP4 files are allowed.");
        return;
      }
      if (!isUnder50MB) {
        toast.error("File too large. Max size is 50 MB.");
        return;
      }
      setFile(selected);
      toast.success(`Selected: ${selected.name}`);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.warn("Please select a video first.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("http://localhost:5000/session/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      toast.success("Uploaded successfully. Video will appear in My Videos.");
      setTimeout(() => router.push("/my-videos"), 1200);
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Sidebar />

      {/* Close Button */}
      <button
        onClick={() => router.push("/session")}
        className="absolute top-6 right-6 bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 text-white p-3 rounded-full shadow-lg transition-all z-50 hover:scale-110"
        title="Back to session"
      >
        <X size={22} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center ml-64 relative z-10 px-10">
        <ToastContainer />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <Upload className="text-orange-300" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-pink-200 bg-clip-text text-transparent">
              Upload Presentation Video
            </h1>
          </div>
          <p className="text-white/70 text-base">Upload your video for AI-powered analysis</p>
        </div>

        {/* Instruction Card */}
        <div className="w-full max-w-2xl mb-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="text-yellow-300" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-300" />
                Instructions
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  Only MP4 files up to 50 MB are allowed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  Ensure clear video and audio quality
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  Video will be analyzed automatically after upload
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="text-center">
            {/* File Display */}
            {file ? (
              <div className="mb-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-green-500/20 rounded-2xl">
                    <FileVideo className="text-green-300" size={40} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg mb-1">{file.name}</p>
                    <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-white/70 hover:text-white text-sm underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="mb-8 p-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 transition-all">
                <div className="p-6 bg-white/10 rounded-2xl inline-block mb-4">
                  <Upload className="text-white/60" size={48} />
                </div>
                <p className="text-white/60 text-base">No file selected yet</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={onFileChange}
            />

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={openPicker}
                disabled={loading}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Upload size={20} />
                {file ? "Choose Different File" : "Choose MP4 File"}
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-orange-500 via-pink-600 to-red-600 hover:from-orange-600 hover:via-pink-700 hover:to-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Start AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
