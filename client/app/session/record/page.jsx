"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Timer from "../timer";
import { Pause, Play, Square, Download, Eye, X } from "lucide-react";
import PreviewModal from "../preview";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../components/bg.css";

const RecordPage = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    async function getMedia() {
      try {
        const constraints = { video: true, audio: true };
        const userStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
        setCameraError(null);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setCameraError("Camera or microphone access denied. Please enable it and refresh.");
        toast.error("Failed to access camera or microphone.");
      }
    }

    getMedia();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) setRecordedChunks((prev) => [...prev, event.data]);
  };

  const startRecording = () => {
    if (!stream) {
      toast.error("No media stream found!");
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setStartTime(new Date());
      toast.info("Recording started!");
    } catch (err) {
      console.error("Error starting MediaRecorder:", err);
      toast.error("Failed to start recording. Try refreshing.");
    }
  };

  const togglePauseResume = () => {
    if (!isRecording) startRecording();
    else if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        toast.info("Recording resumed");
      } else {
        mediaRecorderRef.current.pause();
        toast.warn("Recording paused");
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);

    const endTime = new Date();
    const token = localStorage.getItem("token");
    const videoPath = "local_temp_recording.webm";

    if (!token) {
      toast.error("User not authenticated. Please log in again.");
      router.push("/login");
      return;
    }

    try {
      // ✅ Send token in Authorization header (not body)
      const response = await fetch("http://localhost:5000/session/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ fixed
        },
        body: JSON.stringify({
          video_path: videoPath,
          start_time: startTime?.toISOString(),
          end_time: endTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) toast.success("🎉 Session saved successfully!");
      else toast.error(data.error || "Failed to save session.");
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Something went wrong while saving the session.");
    }
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex items-center justify-center w-screen h-screen bg-black text-white overflow-hidden">
      <ToastContainer />

      <button
        onClick={() => router.push("/session")}
        className="absolute top-4 left-4 bg-[#1E293B]/80 hover:bg-[#334155] text-white rounded-full p-2 shadow-lg transition-all z-50"
      >
        <X size={28} />
      </button>

      {cameraError ? (
        <p className="text-red-400 text-center px-4">{cameraError}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}

      <div className="absolute bottom-6 flex items-center justify-center gap-8 w-full">
        <button
          onClick={togglePauseResume}
          className="bg-gradient-to-r from-[#3ABDF8] to-[#818CF8] text-white p-4 rounded-full hover:opacity-90 shadow-lg"
        >
          {!isRecording ? <Play size={28} /> : isPaused ? <Play size={28} /> : <Pause size={28} />}
        </button>

        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-gradient-to-r from-[#FB7085] to-[#FFA07A] text-white p-4 rounded-full hover:opacity-90 shadow-lg"
          >
            <Square size={28} />
          </button>
        )}

        <Timer isRecording={isRecording} isPaused={isPaused} />
      </div>

      {recordedChunks.length > 0 && (
        <div className="absolute bottom-24 flex items-center justify-center gap-6 w-full">
          <button
            onClick={downloadRecording}
            className="bg-gradient-to-r from-[#3ABDF8] to-[#818CF8] text-white px-5 py-2 rounded-lg hover:opacity-90 shadow-md transition-all"
          >
            <Download size={22} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#3ABDF8] to-[#818CF8] text-white px-5 py-2 rounded-lg hover:opacity-90 shadow-md transition-all"
          >
            <Eye size={22} />
          </button>
        </div>
      )}

      <PreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        recordedChunks={recordedChunks}
        isVideoEnabled={true}
      />
    </div>
  );
};

export default RecordPage;
