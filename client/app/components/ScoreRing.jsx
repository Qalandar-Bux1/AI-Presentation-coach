"use client";

export default function ScoreRing({ score, size = 56, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = score != null ? Math.min(100, Math.max(0, score)) : null;
  const offset =
    safe != null
      ? circumference - (safe / 100) * circumference
      : circumference;

  const color =
    safe == null
      ? "#94a3b8"
      : safe >= 70
        ? "#22c55e"
        : safe >= 50
          ? "#f59e0b"
          : "#ef4444";
  const track =
    safe == null
      ? "#f1f5f9"
      : safe >= 70
        ? "#dcfce7"
        : safe >= 50
          ? "#fef3c7"
          : "#fee2e2";

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {safe != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        )}
      </svg>
      <span
        className="absolute font-bold"
        style={{ color, fontSize: size * 0.26 }}
      >
        {safe != null ? Math.round(safe) : "—"}
      </span>
    </div>
  );
}
