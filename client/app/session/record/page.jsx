"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Timer from "../timer";
import { Pause, Play, Square, Download, Eye, X } from "lucide-react";
import PreviewModal from "../preview";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../components/bg.css";
import { saveVideo } from "../../utils/idb";

const RecordPage = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [title, setTitle] = useState("");
  const animationFrameRef = useRef(null);

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

        // Setup canvas for flipped video processing
        const setupCanvas = () => {
          if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size to match video
            const updateCanvas = () => {
              if (video.videoWidth && video.videoHeight && video.readyState >= 2) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                }

                // Draw flipped video to canvas
                ctx.save();
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                ctx.restore();
              }

              animationFrameRef.current = requestAnimationFrame(updateCanvas);
            };

            // Start updating canvas when video is ready
            if (video.readyState >= 2) {
              updateCanvas();
            } else {
              video.addEventListener('loadedmetadata', () => {
                updateCanvas();
              }, { once: true });
            }
          }
        };

        // Setup canvas after a short delay to ensure video is ready
        setTimeout(setupCanvas, 100);

        setCameraError(null);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setCameraError("Camera or microphone access denied. Please enable it and refresh.");
        toast.error("Failed to access camera or microphone.");
      }
    }

    getMedia();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleDataAvailable = (event) => {
    if (event.data && event.data.size > 0) {
      // Keep a reliable buffer separate from React state
      chunksRef.current.push(event.data);
      setRecordedChunks((prev) => [...prev, event.data]);
    }
  };

  const startRecording = () => {
    if (!stream) {
      toast.error("No media stream found!");
      return;
    }

    try {
      // Use canvas stream for recording (flipped video)
      let recordingStream = stream;

      if (canvasRef.current) {
        const canvasStream = canvasRef.current.captureStream(30); // 30 fps
        // Combine canvas video with original audio
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach(track => {
          canvasStream.addTrack(track);
        });
        recordingStream = canvasStream;
      }

      const mediaRecorder = new MediaRecorder(recordingStream, { mimeType: "video/webm; codecs=vp9" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordedChunks([]);
      mediaRecorder.ondataavailable = handleDataAvailable;

      // Don't auto-save - user must click button
      mediaRecorder.onstop = async () => {
        // Just stop recording, don't save automatically
        // User must click "Save" button to save
      };
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
    // Note: do not create a dummy server session here. Use 'Upload' button to upload blob.

    // Note: local save now handled in mediaRecorder.onstop above.
  };

  const saveToDevice = async () => {
    try {
      const finalChunks = chunksRef.current || recordedChunks;
      if (!finalChunks || finalChunks.length === 0) {
        toast.error("No recording to save.");
        return;
      }
      const blob = new Blob(finalChunks, { type: "video/webm" });

      // Save to device storage (IndexedDB)
      await saveVideo({
        blob,
        start_time: startTime?.toISOString() || new Date().toISOString(),
        end_time: new Date().toISOString(),
        name: `recording-${new Date().toISOString()}.webm`,
      });

      // Upload to server so it appears in My Videos (but don't trigger analysis)
      const token = localStorage.getItem("token") || "";
      if (token) {
        const form = new FormData();
        form.append("file", blob, `recording-${Date.now()}.webm`);
        form.append("start_time", startTime?.toISOString() || new Date().toISOString());
        form.append("end_time", new Date().toISOString());
        if (title.trim()) {
          form.append("title", title.trim());
        }

        try {
          const res = await fetch("http://localhost:5000/session/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
          const data = await res.json();
          if (res.ok) {
            toast.success("✅ Video saved! Redirecting to My Videos...");
            // Redirect to My Videos so user can see the updated list
            setTimeout(() => {
              router.push("/my-videos");
            }, 1000);
          } else {
            toast.warning("✅ Saved to device, but upload failed.");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.warning("✅ Saved to device, but upload failed.");
        }
      } else {
        toast.success("✅ Video saved to device! Please log in to upload.");
      }
    } catch (e) {
      console.error("Failed to save video:", e);
      toast.error("Could not save video.");
    }
  };

  const downloadRecording = async () => {
    try {
      const finalChunks = chunksRef.current || recordedChunks;
      if (!finalChunks || finalChunks.length === 0) {
        toast.error("No recording to download.");
        return;
      }
      const blob = new Blob(finalChunks, { type: "video/webm" });

      // Save to device storage (IndexedDB)
      await saveVideo({
        blob,
        start_time: startTime?.toISOString() || new Date().toISOString(),
        end_time: new Date().toISOString(),
        name: `recording-${new Date().toISOString()}.webm`,
      });

      // Upload to server so it appears in My Videos
      const token = localStorage.getItem("token") || "";
      if (token) {
        const form = new FormData();
        form.append("file", blob, `recording-${Date.now()}.webm`);
        form.append("start_time", startTime?.toISOString() || new Date().toISOString());
        form.append("end_time", new Date().toISOString());
        if (title.trim()) {
          form.append("title", title.trim());
        }

        // Upload in background, don't block download
        fetch("http://localhost:5000/session/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }).then(async (res) => {
          if (res.ok) {
            toast.success("✅ Video saved to My Videos!");
            // Redirect after a short delay
            setTimeout(() => {
              router.push("/my-videos");
            }, 1000);
          } else {
            console.error("Upload failed in background");
            toast.warning("✅ Video downloaded, but upload to server failed.");
          }
        }).catch(err => {
          console.error("Upload error:", err);
          toast.warning("✅ Video downloaded, but upload to server failed.");
        });
      } else {
        toast.success("✅ Video downloaded! Log in to save to cloud.");
      }

      // Direct download of the WebM file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Download error:", e);
      toast.error("Failed to download video.");
    }
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
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-screen h-screen object-contain bg-black"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="hidden"
            style={{ display: 'none' }}
          />
        </>
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

      {recordedChunks.length > 0 && !isRecording && (
        <div className="absolute bottom-24 flex flex-col items-center gap-4 w-full px-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video Title (optional)"
            className="w-full max-w-md px-4 py-2 rounded-lg bg-[#1E293B]/80 border border-[#334155] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ABDF8]"
          />
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={saveToDevice}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-lg hover:opacity-90 shadow-md transition-all"
            >
              Save
            </button>
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
