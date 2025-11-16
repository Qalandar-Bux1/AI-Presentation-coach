"use client";
import { useEffect, useMemo } from "react";

const PreviewModal = ({ isOpen, onClose, recordedChunks, isVideoEnabled, uploadedFileUrl }) => {
  // Safely generate preview URL
  const previewUrl = useMemo(() => {
    if (uploadedFileUrl) return uploadedFileUrl;
    if (recordedChunks?.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: isVideoEnabled ? "video/webm" : "audio/wav",
      });
      return URL.createObjectURL(blob);
    }
    return null;
  }, [recordedChunks, isVideoEnabled, uploadedFileUrl]);

  // Clean up URL after unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen || !previewUrl) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
      <div className="bg-[#1E293B] border border-[#334155] p-6 rounded-2xl w-full max-w-2xl shadow-xl relative text-white">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-[#3ABDF8] transition-colors text-lg"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4 text-[#C9CBD0]">Preview Recording</h2>

        {/* Media Preview */}
        <div className="w-full rounded-lg overflow-hidden border border-[#3ABDF8] bg-black">
          {isVideoEnabled ? (
            <video
              src={previewUrl}
              controls
              autoPlay
              playsInline
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          ) : (
            <audio src={previewUrl} controls className="w-full" />
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-lg bg-gradient-to-r from-[#3ABDF8] to-[#818CF8] text-white font-medium hover:opacity-90 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PreviewModal;
