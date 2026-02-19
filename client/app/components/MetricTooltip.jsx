"use client";
import { useState } from "react";
import { Info } from "lucide-react";

export default function MetricTooltip({ what, why, ideal, interpretation }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="text-slate-400 hover:text-blue-500 transition-colors ml-1"
        aria-label="More info"
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute z-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 p-2.5 text-[11px] leading-relaxed pointer-events-none">
          {what && (
            <p className="mb-1">
              <span className="font-semibold text-slate-700">Measures: </span>
              <span className="text-slate-500">{what}</span>
            </p>
          )}
          {why && (
            <p className="mb-1">
              <span className="font-semibold text-slate-700">
                Why it matters:{" "}
              </span>
              <span className="text-slate-500">{why}</span>
            </p>
          )}
          {ideal && (
            <p className="mb-1">
              <span className="font-semibold text-blue-600">Ideal: </span>
              <span className="text-slate-500">{ideal}</span>
            </p>
          )}
          {interpretation && (
            <p className="pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700">
                Your result:{" "}
              </span>
              <span className="text-slate-500">{interpretation}</span>
            </p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-white border-b border-r border-slate-200 rotate-45"></div>
          </div>
        </div>
      )}
    </span>
  );
}
