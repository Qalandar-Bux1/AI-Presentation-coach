"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Upload, X, FileVideo, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const fileInputRef = useRef(null);

  const openPicker = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "video/mp4" && selected.type !== "video/webm") {
      toast.error("Only MP4 and WebM files are allowed.");
      return;
    }
    if (selected.size > 100 * 1024 * 1024) { // Increased to 100MB for flexibility
      toast.error("Maximum size allowed is 100 MB.");
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
      if (title.trim()) {
        form.append("title", title.trim());
      }

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

      <div className="flex-1 ml-64 relative z-10 p-6 lg:p-8">
        <ToastContainer />
        <button onClick={() => router.push("/session")} className="absolute top-6 right-6 glass p-2.5 rounded-full shadow-lg hover:scale-105 transition-all">
          <X className="text-slate-700" size={20} />
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl px-5 lg:px-6 py-5 mb-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(145deg, #113a4b 0%, #061824 100%)" }}>
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                <Upload className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Upload Presentation Video</h1>
                <p className="text-slate-200 text-sm">Upload your video for AI-powered analysis</p>
              </div>
            </div>
          </div>

          <div className="w-full glass rounded-2xl p-6 lg:p-7 shadow-xl">
          <div className="text-center">
            {file ? (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 border border-green-300">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-3 bg-green-200 rounded-xl">
                    <FileVideo className="text-green-700" size={28} />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-800 font-semibold">{file.name}</p>
                    <p className="text-slate-500 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-slate-600 underline hover:text-slate-800 text-sm">
                  Remove file
                </button>
              </div>
            ) : (
              <div className="mb-6 p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#113a4b] transition-all bg-white/60">
                <div className="p-4 bg-white rounded-xl inline-block mb-3 shadow">
                  <Upload className="text-slate-400" size={36} />
                </div>
                <p className="text-slate-500">No file selected</p>
              </div>
            )}

            <input type="file" ref={fileInputRef} accept="video/mp4,video/webm" className="hidden" onChange={onFileChange} />

            {loading && (
              <div className="w-full mb-5">
                <p className="text-slate-700 text-sm mb-2">Uploading... {uploadProgress}%</p>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-[#113a4b] to-[#061824] rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Video Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Presentation - January 2024"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#113a4b] glass"
                  disabled={loading}
                />
              </div>
              <button onClick={openPicker} disabled={loading} className="w-full glass px-6 py-3 rounded-xl flex items-center justify-center gap-3">
                <Upload size={20} /> {file ? "Choose Another File" : "Choose Video File"}
              </button>
              <button onClick={handleSubmit} disabled={loading || !file} className="w-full btn-gradient text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <><Sparkles size={20} /> Start AI Analysis</>}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
