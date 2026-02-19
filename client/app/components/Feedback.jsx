"use client";
import ScoreRing from "./ScoreRing";
import {
  CheckCircle, Target, MessageSquare, Volume2,
  FileText, User, Zap, TrendingUp
} from "lucide-react";

/**
 * Reusable Feedback component for displaying analysis feedback.
 * Can be embedded in any page that has report data.
 *
 * Props:
 *   report   — analysis_report object from backend
 *   compact  — (optional) if true, renders a smaller version
 */
export default function Feedback({ report, compact = false }) {
  if (!report) return null;

  const feedback = report.feedback || {};
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const overallAssessment = feedback.overall_assessment || "";

  const voice = report.scores?.breakdown?.voice_delivery;
  const content = report.scores?.breakdown?.content_quality;
  const confidence = report.scores?.breakdown?.confidence_body_language;
  const engagement = report.scores?.breakdown?.engagement;

  const lvl = (s) => {
    if (s == null) return { color: "#94a3b8" };
    if (s >= 70) return { color: "#16a34a" };
    if (s >= 50) return { color: "#d97706" };
    return { color: "#dc2626" };
  };

  const categories = [
    { label: "Voice", score: voice?.score, icon: Volume2, accent: "cyan", skipped: voice?.skipped },
    { label: "Content", score: content?.score, icon: FileText, accent: "blue", skipped: content?.skipped },
    { label: "Confidence", score: confidence?.score, icon: User, accent: "purple", skipped: confidence?.skipped },
    { label: "Engagement", score: engagement?.score, icon: Zap, accent: "pink", skipped: engagement?.skipped },
  ].filter(c => !c.skipped && c.score != null);

  return (
    <div className="space-y-5">
      {/* ── Overall Assessment ── */}
      {overallAssessment && (
        <div className={`glass rounded-xl shadow-sm ${compact ? "p-3" : "p-4"}`}>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={compact ? 14 : 16} className="text-blue-500" />
            <h3 className={`font-bold text-slate-800 ${compact ? "text-xs" : "text-sm"}`}>Overall Assessment</h3>
          </div>
          <p className={`text-slate-700 leading-relaxed ${compact ? "text-xs" : "text-[13px]"}`}>{overallAssessment}</p>
        </div>
      )}

      {/* ── Category Score Pills ── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className={`flex items-center gap-2 glass rounded-lg px-3 py-2 shadow-sm ${compact ? "text-xs" : "text-sm"}`}
              >
                <Icon size={compact ? 13 : 15} className={`text-${cat.accent}-500`} />
                <span className="text-slate-600 font-medium">{cat.label}</span>
                <span className="font-bold" style={{ color: lvl(cat.score).color }}>
                  {cat.score.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Strengths & Focus Items ── */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? "gap-3" : "gap-4"}`}>
        {/* Key Strengths */}
        <div className={`rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50/90 via-white/60 to-emerald-50/40 ${compact ? "p-3" : "p-5"} shadow-sm`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`${compact ? "p-1.5" : "p-2"} bg-emerald-100 rounded-xl`}>
              <CheckCircle size={compact ? 16 : 20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className={`font-bold text-emerald-800 ${compact ? "text-sm" : "text-base"}`}>Key Strengths</h3>
              {!compact && <p className="text-[11px] text-emerald-600">What you did well</p>}
            </div>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={10} className="text-emerald-600" />
                  </span>
                  <span className={`text-emerald-900 leading-snug ${compact ? "text-xs" : "text-[13px]"}`}>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`text-emerald-600 italic text-center ${compact ? "text-xs py-2" : "text-sm py-4"}`}>Keep practicing!</p>
          )}
        </div>

        {/* Focus Items */}
        <div className={`rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50/90 via-white/60 to-red-50/30 ${compact ? "p-3" : "p-5"} shadow-sm`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`${compact ? "p-1.5" : "p-2"} bg-amber-100 rounded-xl`}>
              <Target size={compact ? 16 : 20} className="text-amber-600" />
            </div>
            <div>
              <h3 className={`font-bold text-amber-800 ${compact ? "text-sm" : "text-base"}`}>Focus Items</h3>
              {!compact && <p className="text-[11px] text-amber-600">Areas to work on</p>}
            </div>
          </div>
          {improvements.length > 0 ? (
            <ul className="space-y-2">
              {improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 text-[9px] font-bold">!</span>
                  </span>
                  <span className={`text-amber-900 leading-snug ${compact ? "text-xs" : "text-[13px]"}`}>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`text-amber-600 italic text-center ${compact ? "text-xs py-2" : "text-sm py-4"}`}>Outstanding work!</p>
          )}
        </div>
      </div>
    </div>
  );
}
