"use client";
import { BsFillCameraVideoFill } from "react-icons/bs";

const ToggleSwitch = ({ isVideoEnabled, setIsVideoEnabled }) => {
  return (
    <div className="flex items-center space-x-3 py-4">
      <BsFillCameraVideoFill
        className={`${
          isVideoEnabled ? "text-[#3ABDF8]" : "text-gray-400"
        } transition-colors`}
        size={24}
      />

      {/* Toggle Button */}
      <label className="relative inline-block w-14 h-7 cursor-pointer">
        <input
          type="checkbox"
          checked={isVideoEnabled}
          onChange={() => setIsVideoEnabled(!isVideoEnabled)}
          className="sr-only"
        />
        {/* Track */}
        <span
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isVideoEnabled ? "bg-[#3ABDF8]" : "bg-gray-600"
          }`}
        ></span>
        {/* Knob */}
        <span
          className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
            isVideoEnabled ? "translate-x-7" : ""
          }`}
        ></span>
      </label>

      {/* Label Text */}
      <span
        className={`text-sm sm:text-base font-medium transition-colors ${
          isVideoEnabled ? "text-[#3ABDF8]" : "text-gray-300"
        }`}
      >
        {isVideoEnabled ? "Video Enabled" : "Audio Only"}
      </span>
    </div>
  );
};

export default ToggleSwitch;
