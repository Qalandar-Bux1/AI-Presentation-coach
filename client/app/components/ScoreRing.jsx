
"use client";
import React from "react";

export default function ScoreRing({ score, size = 100, strokeWidth = 8 }) {
  const normalizedScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((normalizedScore ?? 0) / 100) * circumference;

  const ringColorClass = (() => {
    if (normalizedScore == null) return "text-slate-400";
    if (normalizedScore >= 90) return "text-emerald-500";
    if (normalizedScore >= 70) return "text-blue-500";
    if (normalizedScore >= 50) return "text-amber-400";
    return "text-red-500";
  })();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-slate-200"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className={ringColorClass}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold text-slate-700">
          {normalizedScore == null ? "—" : Math.round(normalizedScore)}
        </span>
      </div>
    </div>
  );
}
