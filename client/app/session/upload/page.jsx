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
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const fileInputRef = useRef(null);

  const openPicker = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "video/mp4") {
      toast.error("Only MP4 files are allowed.");
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      toast.error("Maximum size allowed is 50 MB.");
      return;
    }

    setFile(selected);
    toast.success(`Selected: ${selected.name}`);
  };

  const handleSubmit = async () => {
    if (!file) return toast.warn("Please choose a file first.");

    try {
      setLoading(true);
      setUploadProgress(0);

      const token = localStorage.getItem("token");
      if (!token) return toast.error("No auth token found");

      const form = new FormData();
      form.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5000/session/upload");

      // ✅ Only set Authorization, DO NOT set Content-Type manually
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status !== 201) {
            toast.error(data?.error || "Upload failed");
          } else {
            toast.success("Uploaded Successfully!");
            setTimeout(() => router.push("/my-videos"), 1500);
          }
        } catch (err) {
          toast.error("Upload failed: Invalid response");
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        toast.error("Upload failed. Try again.");
        setLoading(false);
      };

      xhr.send(form);

    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <Sidebar />
      <button onClick={() => router.push("/session")} className="absolute top-6 right-6 glass p-3 rounded-full shadow-lg hover:scale-110 transition-all">
        <X className="text-slate-700" size={22} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center ml-64 relative px-10 z-10">
        <ToastContainer />
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 glass rounded-xl">
              <Upload className="text-ai-blue" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gradient">Upload Presentation Video</h1>
          </div>
          <p className="text-slate-600">Upload your video for AI-powered analysis</p>
        </div>

        {/* UPLOAD CARD */}
        <div className="w-full max-w-2xl glass rounded-3xl p-10 shadow-xl">
          <div className="text-center">
            {file ? (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-green-200 rounded-2xl">
                    <FileVideo className="text-green-700" size={40} />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-800 font-semibold text-lg">{file.name}</p>
                    <p className="text-slate-500 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-slate-600 underline hover:text-slate-800 text-sm">
                  Remove file
                </button>
              </div>
            ) : (
              <div className="mb-8 p-12 rounded-2xl border-2 border-dashed border-slate-300 hover:border-ai-blue transition-all bg-white/60">
                <div className="p-6 bg-white rounded-2xl inline-block mb-4 shadow">
                  <Upload className="text-slate-400" size={48} />
                </div>
                <p className="text-slate-500">No file selected</p>
              </div>
            )}

            <input type="file" ref={fileInputRef} accept="video/mp4" className="hidden" onChange={onFileChange} />

            {loading && (
              <div className="w-full mb-6">
                <p className="text-slate-700 text-sm mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-ai-blue to-ai-purple rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button onClick={openPicker} disabled={loading} className="w-full glass px-8 py-4 rounded-xl flex items-center justify-center gap-3">
                <Upload size={20} /> {file ? "Choose Another File" : "Choose MP4 File"}
              </button>
              <button onClick={handleSubmit} disabled={loading || !file} className="w-full btn-gradient text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 text-lg disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <><Sparkles size={20} /> Start AI Analysis</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
