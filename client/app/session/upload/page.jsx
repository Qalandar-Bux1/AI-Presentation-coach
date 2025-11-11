
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Upload, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const alreadyOpened = useRef(false); // 🧠 prevents double-open

  useEffect(() => {
    // Only trigger file picker once
    if (alreadyOpened.current) return;
    alreadyOpened.current = true;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/mp4,video/webm";
    input.onchange = (e) => {
      const selected = e.target.files[0];
      if (selected) {
        setFile(selected);
        toast.success(`Selected: ${selected.name}`);
      } else {
        router.push("/session"); // back if canceled
      }
    };
    input.click();
  }, [router]);

  const handleSubmit = () => {
    if (!file) {
      toast.warn("Please select a video first.");
      return;
    }

    setLoading(true);
    toast.info("Analyzing video with AI...");

    setTimeout(() => {
      setLoading(false);
      toast.success("✅ AI analysis complete! (Demo)");
      setTimeout(() => router.push("/session"), 2000);
    }, 2500);
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-white relative">
      <Sidebar />

      {/* ❌ Cross Button */}
      <button
        onClick={() => router.push("/session")}
        className="absolute top-6 right-6 bg-[#1E293B] hover:bg-[#334155] text-white p-2 rounded-full shadow-md transition-all z-50"
        title="Back to session"
      >
        <X size={22} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center ml-56">
        <ToastContainer />
        <h1 className="text-3xl font-bold mb-6">Upload Presentation Video</h1>

        <div className="w-full max-w-lg bg-[#1E293B] rounded-lg shadow-lg p-8 border border-[#334155] text-center">
          <Upload size={40} className="mx-auto mb-4 text-[#3ABDF8]" />
          {file ? (
            <p className="text-gray-300 mb-6">Selected: {file.name}</p>
          ) : (
            <p className="text-gray-400 mb-6">No file selected yet...</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-[#3ABDF8] to-[#818CF8] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all"
          >
            {loading ? "Analyzing..." : "Start AI Analysis"}
          </button>
        </div>
      </div>
    </div>
  );
}   

