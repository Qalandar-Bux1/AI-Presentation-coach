"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function AnalysisProgress({ sessionId, onComplete, onError }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("running");
  const [message, setMessage] = useState("Starting analysis...");
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!sessionId || !polling) return;

    const pollProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setPolling(false);
          return;
        }

        const res = await fetch(`http://localhost:5000/session/${sessionId}/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch progress");
        }

        const data = await res.json();

        // Check for failure FIRST (even if status is still "processing")
        // This handles cases where DB update is slightly delayed
        if (data.status === "failed" || data.error) {
          setPolling(false);
          setStatus("failed");
          setProgress(0);

          // Format error message for display
          let errorMessage = data.error || data.message || "Analysis failed. Please try again.";

          // Extract error from message if it contains "Analysis failed:"
          if (errorMessage.includes("Analysis failed:")) {
            errorMessage = errorMessage.replace("Analysis failed:", "").trim();
          }

          if (errorMessage.toLowerCase().includes("too short") ||
            errorMessage.toLowerCase().includes("minimum presentation length") ||
            errorMessage.toLowerCase().includes("video is too short")) {
            errorMessage = "❌ Video is too short or not a presentation. Please upload a video longer than 10 seconds.";
          }

          setError(errorMessage);
          setMessage(errorMessage);

          if (onError) {
            onError(errorMessage);
          }

          toast.error(errorMessage);
          return; // Stop processing, don't update other state
        }

        setProgress(data.progress || 0);
        const statusValue = data.status || "unknown";
        setStatus(statusValue === "processing" ? "running" : statusValue); // Map processing to running for UI
        setMessage(data.message || "");
        setError(null); // Clear error if no error in response

        // Handle completion
        if (statusValue.includes("completed") || data.completed) {
          setPolling(false);
          setProgress(100);

          if (statusValue == "completed_with_warning") {
            setStatus("completed_with_warning");
            setMessage("Analysis completed with some warnings.");
          } else {
            setStatus("completed");
            setMessage("Analysis completed successfully!");
          }

          if (onComplete) {
            onComplete();
          }

          if (statusValue === "completed_with_warning") {
            toast.warning("Analysis completed with limitations.");
          } else {
            toast.success("Analysis completed! View results in Reports or Results.");
          }
        }

        // Stop polling if status is not_started (shouldn't happen, but handle gracefully)
        if (statusValue === "not_started") {
          setPolling(false);
        }

      } catch (err) {
        console.error("Progress polling error:", err);
        // Don't stop polling on network errors, just log
      }
    };

    // Poll immediately, then every 3 seconds (reduced frequency)
    pollProgress();
    const interval = setInterval(pollProgress, 3000);

    return () => clearInterval(interval);
  }, [sessionId, polling, onComplete, onError]);

  // Don't render if not started
  if (status === "not_started") {
    return null;
  }

  return (
    <div className="glass rounded-xl p-4 mb-4 shadow-glass border-l-4 border-primary-500">
      <div className="flex items-center gap-3 mb-3">
        {status === "running" && (
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
        )}
        {status.includes("completed") && (
          <CheckCircle className={`w-5 h-5 ${status === "completed_with_warning" ? "text-yellow-500" : "text-green-500"}`} />
        )}
        {status === "failed" && (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {status === "running" && "Analyzing Video..."}
            {status === "completed" && "Analysis Complete"}
            {status === "completed_with_warning" && "Analysis Complete (with warnings)"}
            {status === "failed" && "Analysis Failed"}
          </p>
          <p className="text-xs text-slate-600 mt-1">{message}</p>
        </div>
        <span className="text-sm font-bold text-primary-600">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ 
            width: `${progress}%`,
            minWidth: progress > 0 ? '2%' : '0%'
          }}
        ></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Status Info */}
      {status === "running" && (
        <p className="text-xs text-slate-500 mt-2">
          This may take 2-5 minutes depending on video length...
        </p>
      )}
    </div>
  );
}
