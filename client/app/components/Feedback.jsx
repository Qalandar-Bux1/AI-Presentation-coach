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
  const strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
  const improvements = Array.isArray(feedback.improvements) ? feedback.improvements : [];
  const overallAssessment =
    feedback.overall_assessment ||
    feedback.summary ||
    feedback.voice ||
    "";

  const voice = report.scores?.breakdown?.voice_delivery;
  const content = report.scores?.breakdown?.content_quality;
  const confidence = report.scores?.breakdown?.confidence_body_language;
  const engagement = report.scores?.breakdown?.engagement;

  const legacyFeedbackItems = [
    { label: "Voice Delivery", text: feedback.voice, icon: Volume2, tone: "#2563eb", bg: "#eff6ff" },
    { label: "Body Language", text: feedback.expressions, icon: User, tone: "#7c3aed", bg: "#f5f3ff" },
    { label: "Vocabulary", text: feedback.vocabulary, icon: FileText, tone: "#0f766e", bg: "#f0fdfa" },
  ].filter((item) => item.text);

  const iconColors = {
    cyan: "#0891b2",
    blue: "#2563eb",
    purple: "#7c3aed",
    pink: "#db2777",
  };

  const glassStyle = {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(148,163,184,0.14)",
    boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
    backdropFilter: "blur(14px)",
  };

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
        <div className={`rounded-2xl ${compact ? "p-3" : "p-5"}`} style={glassStyle}>
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
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${compact ? "text-xs" : "text-sm"}`}
                style={glassStyle}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: compact ? 24 : 28, height: compact ? 24 : 28, background: `${iconColors[cat.accent]}15` }}
                >
                  <Icon size={compact ? 13 : 15} style={{ color: iconColors[cat.accent] }} />
                </div>
                <span className="text-slate-600 font-medium">{cat.label}</span>
                <span className="font-bold" style={{ color: lvl(cat.score).color }}>
                  {cat.score.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {legacyFeedbackItems.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? "gap-3" : "gap-4"}`}>
          {legacyFeedbackItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-2xl ${compact ? "p-3" : "p-5"}`} style={glassStyle}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl p-2" style={{ background: item.bg }}>
                    <Icon size={compact ? 16 : 18} style={{ color: item.tone }} />
                  </div>
                  <h3 className={`font-semibold text-slate-800 ${compact ? "text-sm" : "text-base"}`}>{item.label}</h3>
                </div>
                <p className={`text-slate-600 leading-relaxed ${compact ? "text-xs" : "text-sm"}`}>{item.text}</p>
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
