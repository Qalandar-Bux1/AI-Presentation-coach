"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ScoreRing from "../../components/ScoreRing";
import MetricTooltip from "../../components/MetricTooltip";
import "../../components/bg.css";
import {
  ArrowLeft, Loader2, AlertCircle, Volume2, FileText, User, Zap,
  ChevronDown, TrendingUp, Download
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── Helpers ────────────────────────────────────────────── */
const lvl = (s) => {
  if (s == null) return { label: "N/A", bg: "bg-slate-100", text: "text-slate-500", bar: "bg-slate-300" };
  if (s >= 80) return { label: "Excellent", bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (s >= 70) return { label: "Good", bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" };
  if (s >= 50) return { label: "Average", bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" };
  return { label: "Needs Work", bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" };
};

const speedBadge = (wpm) => {
  if (wpm == null) return { label: "N/A", bg: "bg-slate-100", text: "text-slate-500" };
  if (wpm < 100) return { label: "Too Slow ↓", bg: "bg-red-50", text: "text-red-600" };
  if (wpm <= 160) return { label: "Good Pace ✓", bg: "bg-green-50", text: "text-green-600" };
  if (wpm <= 180) return { label: "Slightly Fast", bg: "bg-amber-50", text: "text-amber-600" };
  return { label: "Too Fast ↑", bg: "bg-red-50", text: "text-red-600" };
};

const fillerBadge = (pct) => {
  if (pct == null) return { label: "N/A", bg: "bg-slate-100", text: "text-slate-500" };
  if (pct < 3) return { label: "Low ✓", bg: "bg-green-50", text: "text-green-600" };
  if (pct < 6) return { label: "Moderate", bg: "bg-amber-50", text: "text-amber-600" };
  return { label: "High ↑", bg: "bg-red-50", text: "text-red-600" };
};

const gradeColor = (g) => {
  if (!g) return { text: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
  if (g.startsWith("A") || g === "Excellent") return { text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
  if (g.startsWith("B") || g === "Good" || g === "Very Good") return { text: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
  if (g.startsWith("C") || g === "Fair") return { text: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  return { text: "text-red-700", bg: "bg-red-50 border-red-200" };
};

/* ─── Tiny UI Pieces ─────────────────────────────────────── */
const ScoreBar = ({ score }) => {
  const l = lvl(score);
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-3">
      <div
        className={`h-full rounded-full ${l.bar} transition-all duration-1000 ease-out`}
        style={{ width: `${score != null ? Math.min(100, score) : 0}%` }}
      />
    </div>
  );
};

const Badge = ({ label, bg, text }) => (
  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${bg} ${text}`}>
    {label}
  </span>
);

const MetricRow = ({ label, value, unit, badge, tooltip }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100/60 last:border-0">
    <div className="flex items-center gap-1 text-[13px] text-slate-600">
      <span>{label}</span>
      {tooltip && <MetricTooltip {...tooltip} />}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-slate-800">
        {value ?? "N/A"}
        {unit && <span className="text-slate-400 font-normal text-xs">{unit}</span>}
      </span>
      {badge && <Badge {...badge} />}
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId;

  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState({});

  /* ── Fetch (unchanged API logic) ────────────────────────── */
  useEffect(() => {
    if (!sessionId) { setError("Session ID is required"); setLoading(false); return; }

    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Please log in to view results"); setLoading(false); return; }

        let res;
        try {
          res = await fetch(`http://localhost:5000/session/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
        } catch (fetchError) {
          if (fetchError.message.includes("Failed to fetch") || fetchError.message.includes("ERR_CONNECTION")) {
            throw new Error("Cannot connect to backend server. Please ensure the Flask server is running on http://localhost:5000");
          }
          throw fetchError;
        }

        if (!res.ok) {
          const errorText = await res.text();
          let errorData;
          try { errorData = JSON.parse(errorText); } catch { errorData = { error: `Server error: ${res.status} ${res.statusText}` }; }
          throw new Error(errorData?.error || "Failed to fetch session");
        }

        const data = await res.json();
        const sessionData = data.session;
        setSession(sessionData);

        const analysisStatus = sessionData.analysis_status || "not_started";
        if (analysisStatus === "processing") { setError("Analysis is still in progress. Please wait for it to complete."); setLoading(false); return; }
        if (analysisStatus === "failed") { setError(`Analysis failed: ${sessionData.analysis_error || "Unknown error"}`); setLoading(false); return; }
        if (analysisStatus === "completed_with_warning") {
          toast.warning(sessionData.warning_message || sessionData.analysis_report?.warning_message || "Analysis completed with limitations");
        }

        if (!sessionData.analysis_report && !sessionData.feedback) { setError("Analysis report not found. Please analyze the video first."); setLoading(false); return; }

        if (sessionData.analysis_report) {
          setReport(sessionData.analysis_report);
        } else if (sessionData.feedback) {
          setReport({
            scores: {
              final_score: sessionData.score || 0,
              grade: sessionData.grade || "N/A",
              rating: sessionData.grade || "N/A",
              breakdown: {
                voice_delivery: { score: 0, weight: 0.30 },
                content_quality: { score: 0, weight: 0.30 },
                confidence_body_language: { score: 0, weight: 0.25 },
                engagement: { score: 0, weight: 0.15 },
              },
            },
            feedback: sessionData.feedback,
            audio_analysis: {},
            text_analysis: {},
            video_analysis: {},
          });
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message || "Failed to load analysis report");
        toast.error(err.message || "Failed to load analysis report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  const toggle = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  /* ── Loading state ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading results…</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center p-8">
          <div className="glass rounded-2xl p-8 max-w-md text-center shadow-glass">
            <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-600 mb-5 text-sm">{error}</p>
            <button onClick={() => router.push("/my-videos")} className="btn-gradient text-white px-5 py-2 rounded-xl text-sm font-medium">
              Back to Videos
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── No report state ───────────────────────────────────── */
  if (!report) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center p-8">
          <div className="glass rounded-2xl p-8 max-w-md text-center shadow-glass">
            <AlertCircle className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Report</h2>
            <p className="text-slate-600 mb-5 text-sm">This session hasn&apos;t been analyzed yet.</p>
            <button onClick={() => router.push("/my-videos")} className="btn-gradient text-white px-5 py-2 rounded-xl text-sm font-medium">
              Back to Videos
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── Extract report data ───────────────────────────────── */
  const finalScore = report.scores?.final_score;
  const grade = report.scores?.grade || "N/A";
  const rating = report.scores?.rating || grade;
  const hasScore = finalScore != null;

  const voice = report.scores?.breakdown?.voice_delivery;
  const content = report.scores?.breakdown?.content_quality;
  const confidence = report.scores?.breakdown?.confidence_body_language;
  const engagement = report.scores?.breakdown?.engagement;

  const audio = report.audio_analysis || {};
  const text = report.text_analysis || {};
  const video = report.video_analysis || {};
  const feedback = report.feedback || {};
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];

  const wpm = audio.speaking_speed?.wpm;
  const fillerPct = audio.filler_words?.percentage;
  const fillerTotal = audio.filler_words?.total;
  const pitchStab = audio.pitch?.stability_score;
  const volStab = audio.volume?.stability_score;
  const grammarScore = text.grammar?.score;
  const repetitionScore = text.repetition?.repetition_score;
  const wordCount = text.word_count || report.metadata?.word_count;
  const hasIntro = text.structure?.has_intro;
  const hasBody = text.structure?.has_body;
  const hasConclusion = text.structure?.has_conclusion;
  const eyeScore = video.eye_contact?.score;
  const postureScore = video.posture?.score;
  const facePresence = video.face_presence?.percentage;
  const gestureFreq = video.gestures?.frequency_percentage;
  const confEstimate = video.confidence_estimate;

  const gc = gradeColor(grade);

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen">
      <ToastContainer />
      <Sidebar />

      <main className="flex-1 ml-64 p-5 lg:p-7 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="mb-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Analysis Results</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {session?.title || "Presentation"}
                  {session?.start_time ? ` • ${new Date(session.start_time).toLocaleDateString()}` : ""}
                  {report?.metadata?.duration_seconds ? ` • ${Math.round(report.metadata.duration_seconds)}s` : ""}
                </p>
              </div>
              <button
                onClick={() => router.push(`/reports/${sessionId}`)}
                className="btn-gradient text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <FileText size={15} /> Full Report
              </button>
            </div>
          </div>

          {/* ── Warnings ────────────────────────────────── */}
          {(!report?.metadata?.speech_detected || !report?.metadata?.face_detected || finalScore === null) && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-amber-700">
                {!report.metadata?.speech_detected && !report.metadata?.face_detected
                  ? "No speech or face detected — limited analysis available."
                  : !report.metadata?.speech_detected
                    ? `No speech detected (${report.metadata?.word_count || 0} words). Speech metrics unavailable.`
                    : "No face detected. Visual metrics unavailable."}
              </p>
            </div>
          )}

          {(session?.analysis_status === "completed_with_warning" || report?.warning_message) && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-yellow-50/80 border border-yellow-300 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-yellow-700">
                {session?.warning_message || report?.warning_message || "Some metrics may be limited."}
              </p>
            </div>
          )}

          {/* ── Overall Score (compact) ───────────────── */}
          <div className="glass rounded-2xl p-5 mb-5 shadow-glass">
            {hasScore ? (
              <div className="flex items-center gap-5 flex-wrap">
                <ScoreRing score={finalScore} size={76} strokeWidth={6} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Overall Score</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {finalScore.toFixed(1)}
                    <span className="text-base text-slate-400 font-normal ml-1">/ 100</span>
                  </p>
                </div>
                <div className={`px-4 py-2.5 rounded-xl border text-center ${gc.bg}`}>
                  <p className={`text-xl font-bold ${gc.text}`}>{rating}</p>
                  <p className={`text-[11px] ${gc.text} opacity-75`}>{grade}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <AlertCircle className="text-slate-400" size={28} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Overall Score</p>
                  <p className="text-xl font-bold text-slate-500">Not Available</p>
                  <p className="text-xs text-slate-400">{report.scores?.warning || "Insufficient data for scoring"}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── 4 Category Cards (2×2 compact grid) ─────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

            {/* Voice & Delivery */}
            {!voice?.skipped && voice?.score != null && (
              <div className="glass rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-100 rounded-lg"><Volume2 size={14} className="text-cyan-600" /></div>
                    <h3 className="text-[13px] font-bold text-slate-800">Voice & Delivery</h3>
                  </div>
                  <ScoreRing score={voice.score} size={38} strokeWidth={3} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Speed</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{wpm ?? "—"} WPM</span>
                      <Badge {...speedBadge(wpm)} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Fillers</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{fillerPct != null ? `${fillerPct.toFixed(1)}%` : "—"}</span>
                      <Badge {...fillerBadge(fillerPct)} />
                    </div>
                  </div>
                </div>
                <ScoreBar score={voice.score} />
              </div>
            )}

            {/* Content Quality */}
            {!content?.skipped && content?.score != null && (
              <div className="glass rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg"><FileText size={14} className="text-blue-600" /></div>
                    <h3 className="text-[13px] font-bold text-slate-800">Content Quality</h3>
                  </div>
                  <ScoreRing score={content.score} size={38} strokeWidth={3} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Grammar</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{grammarScore != null ? `${grammarScore.toFixed(0)}/100` : "—"}</span>
                      <Badge {...lvl(grammarScore)} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Structure</span>
                    <div className="flex gap-1">
                      {[{ k: hasIntro, l: "I" }, { k: hasBody, l: "B" }, { k: hasConclusion, l: "C" }].map((s) => (
                        <span key={s.l} className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${s.k ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          {s.l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ScoreBar score={content.score} />
              </div>
            )}

            {/* Confidence & Body Language */}
            {!confidence?.skipped && confidence?.score != null && (
              <div className="glass rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg"><User size={14} className="text-purple-600" /></div>
                    <h3 className="text-[13px] font-bold text-slate-800">Confidence</h3>
                  </div>
                  <ScoreRing score={confidence.score} size={38} strokeWidth={3} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Eye Contact</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{eyeScore != null ? `${eyeScore.toFixed(0)}/100` : "—"}</span>
                      <Badge {...lvl(eyeScore)} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Posture</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{postureScore != null ? `${postureScore.toFixed(0)}/100` : "—"}</span>
                      <Badge {...lvl(postureScore)} />
                    </div>
                  </div>
                </div>
                <ScoreBar score={confidence.score} />
              </div>
            )}

            {/* Engagement */}
            {!engagement?.skipped && engagement?.score != null && (
              <div className="glass rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-pink-100 rounded-lg"><Zap size={14} className="text-pink-600" /></div>
                    <h3 className="text-[13px] font-bold text-slate-800">Engagement</h3>
                  </div>
                  <ScoreRing score={engagement.score} size={38} strokeWidth={3} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Confidence</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{confEstimate != null ? `${confEstimate.toFixed(0)}/100` : "—"}</span>
                      <Badge {...lvl(confEstimate)} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Gestures</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">{gestureFreq != null ? `${gestureFreq.toFixed(0)}%` : "—"}</span>
                    </div>
                  </div>
                </div>
                <ScoreBar score={engagement.score} />
              </div>
            )}
          </div>

          {/* ── Collapsible Detailed Metrics ────────────── */}
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-800 mb-2.5 flex items-center gap-2">
              <TrendingUp size={17} className="text-blue-500" />
              Detailed Metrics
            </h2>

            <div className="space-y-3">
              {/* ── Voice & Delivery Accordion ── */}
              {!voice?.skipped && voice?.score != null && (
                <div className={`rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-md ${
                  openSections.voice 
                    ? "border-cyan-400 shadow-lg bg-white" 
                    : "border-slate-300 hover:border-cyan-300 hover:shadow-lg bg-white/95 hover:bg-white"
                }`}>
                  <button onClick={() => toggle("voice")} className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 text-left cursor-pointer group ${
                    openSections.voice 
                      ? "bg-gradient-to-r from-cyan-50 via-cyan-25 to-white" 
                      : "hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-white"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                        openSections.voice 
                          ? "bg-cyan-500 shadow-md" 
                          : "bg-cyan-100 group-hover:bg-cyan-200"
                      }`}>
                        <Volume2 size={17} className={openSections.voice ? "text-white" : "text-cyan-600"} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">Voice & Delivery</span>
                      <Badge {...lvl(voice.score)} />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-cyan-600 group-hover:text-cyan-700">
                        {openSections.voice ? "Hide Details" : "Show Details"}
                      </span>
                      <ChevronDown size={18} className={`text-cyan-600 transition-transform duration-300 ${
                        openSections.voice ? "rotate-180" : ""
                      }`} />
                    </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openSections.voice 
                      ? "max-h-96 opacity-100" 
                      : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-5 pb-4 pt-1 bg-white border-t border-slate-100">
                      <MetricRow label="Speaking Speed" value={wpm} unit=" WPM" badge={speedBadge(wpm)}
                        tooltip={{ what: "Words spoken per minute", why: "Proper pacing helps your audience follow along", ideal: "120–160 WPM",
                          interpretation: wpm != null ? (wpm < 100 ? "Too slow — try a slightly faster pace" : wpm > 180 ? "Too fast — slow down for clarity" : "Great pace!") : null }} />
                      <MetricRow label="Filler Words" value={fillerTotal ?? "—"} unit={fillerPct != null ? ` (${fillerPct.toFixed(1)}%)` : ""} badge={fillerBadge(fillerPct)}
                        tooltip={{ what: "Um, uh, like, you know occurrences", why: "Fillers reduce perceived confidence", ideal: "Below 3% of total words",
                          interpretation: fillerPct != null ? (fillerPct < 3 ? "Minimal fillers — excellent" : fillerPct < 6 ? "Moderate — try pausing instead" : "High — replace fillers with pauses") : null }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Content Quality Accordion ── */}
              {!content?.skipped && content?.score != null && (
                <div className={`rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-md ${
                  openSections.content 
                    ? "border-blue-400 shadow-lg bg-white" 
                    : "border-slate-300 hover:border-blue-300 hover:shadow-lg bg-white/95 hover:bg-white"
                }`}>
                  <button onClick={() => toggle("content")} className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 text-left cursor-pointer group ${
                    openSections.content 
                      ? "bg-gradient-to-r from-blue-50 via-blue-25 to-white" 
                      : "hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-white"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                        openSections.content 
                          ? "bg-blue-500 shadow-md" 
                          : "bg-blue-100 group-hover:bg-blue-200"
                      }`}>
                        <FileText size={17} className={openSections.content ? "text-white" : "text-blue-600"} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">Content Quality</span>
                      <Badge {...lvl(content.score)} />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                        {openSections.content ? "Hide Details" : "Show Details"}
                      </span>
                      <ChevronDown size={18} className={`text-blue-600 transition-transform duration-300 ${
                        openSections.content ? "rotate-180" : ""
                      }`} />
                    </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openSections.content 
                      ? "max-h-96 opacity-100" 
                      : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-5 pb-4 pt-1 bg-white border-t border-slate-100">
                      <MetricRow label="Grammar" value={grammarScore != null ? grammarScore.toFixed(1) : null} unit="/100" badge={lvl(grammarScore)}
                        tooltip={{ what: "Grammatical correctness of your speech", why: "Good grammar conveys professionalism", ideal: "80+ out of 100",
                          interpretation: text.grammar?.issues?.length > 0 ? `${text.grammar.issues.length} issue(s) found` : "No issues detected" }} />
                      <MetricRow label="Repetition" value={repetitionScore != null ? repetitionScore.toFixed(1) : null} unit="/100"
                        tooltip={{ what: "How much you repeat words or phrases", why: "Repetition can bore your audience", ideal: "70+ (less repetition)" }} />
                      <MetricRow label="Word Count" value={wordCount || "—"} unit=" words"
                        tooltip={{ what: "Total words spoken", why: "Shows preparation depth", ideal: "Varies by duration" }} />
                      <div className="flex items-center justify-between py-2 border-b border-slate-100/60 last:border-0">
                        <div className="flex items-center gap-1 text-[13px] text-slate-600">
                          <span>Structure</span>
                          <MetricTooltip what="Intro, body & conclusion presence" why="Clear structure helps audience follow your argument" ideal="All 3 sections present" />
                        </div>
                        <div className="flex gap-1.5">
                          {[{ k: hasIntro, l: "Intro" }, { k: hasBody, l: "Body" }, { k: hasConclusion, l: "Conclusion" }].map((s) => (
                            <span key={s.l} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.k ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}>
                              {s.k ? "✓" : "✗"} {s.l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Confidence & Body Language Accordion ── */}
              {!confidence?.skipped && confidence?.score != null && (
                <div className={`rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-md ${
                  openSections.confidence 
                    ? "border-purple-400 shadow-lg bg-white" 
                    : "border-slate-300 hover:border-purple-300 hover:shadow-lg bg-white/95 hover:bg-white"
                }`}>
                  <button onClick={() => toggle("confidence")} className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 text-left cursor-pointer group ${
                    openSections.confidence 
                      ? "bg-gradient-to-r from-purple-50 via-purple-25 to-white" 
                      : "hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-white"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                        openSections.confidence 
                          ? "bg-purple-500 shadow-md" 
                          : "bg-purple-100 group-hover:bg-purple-200"
                      }`}>
                        <User size={17} className={openSections.confidence ? "text-white" : "text-purple-600"} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">Confidence</span>
                      <Badge {...lvl(confidence.score)} />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-purple-600 group-hover:text-purple-700">
                        {openSections.confidence ? "Hide Details" : "Show Details"}
                      </span>
                      <ChevronDown size={18} className={`text-purple-600 transition-transform duration-300 ${
                        openSections.confidence ? "rotate-180" : ""
                      }`} />
                    </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openSections.confidence 
                      ? "max-h-96 opacity-100" 
                      : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-5 pb-4 pt-1 bg-white border-t border-slate-100">
                      <MetricRow label="Eye Contact" value={eyeScore != null ? eyeScore.toFixed(1) : null} unit="/100" badge={lvl(eyeScore)}
                        tooltip={{ what: "Camera/audience eye contact", why: "Builds trust and engagement", ideal: "60%+",
                          interpretation: video.eye_contact?.assessment?.replace(/_/g, " ") }} />
                      <MetricRow label="Posture" value={postureScore != null ? postureScore.toFixed(1) : null} unit="/100" badge={lvl(postureScore)}
                        tooltip={{ what: "Body alignment and positioning", why: "Good posture shows confidence", ideal: "70+",
                          interpretation: video.posture?.assessment?.replace(/_/g, " ") }} />
                      <MetricRow label="Gestures" value={gestureFreq != null ? `${gestureFreq.toFixed(0)}%` : null}
                        tooltip={{ what: "Hand and body movement frequency", why: "Natural gestures enhance delivery", ideal: "10–40% frequency",
                          interpretation: video.gestures?.assessment?.replace(/_/g, " ") }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Engagement Accordion ── */}
              {!engagement?.skipped && engagement?.score != null && (
                <div className={`rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-md ${
                  openSections.engagement 
                    ? "border-pink-400 shadow-lg bg-white" 
                    : "border-slate-300 hover:border-pink-300 hover:shadow-lg bg-white/95 hover:bg-white"
                }`}>
                  <button onClick={() => toggle("engagement")} className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 text-left cursor-pointer group ${
                    openSections.engagement 
                      ? "bg-gradient-to-r from-pink-50 via-pink-25 to-white" 
                      : "hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-white"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                        openSections.engagement 
                          ? "bg-pink-500 shadow-md" 
                          : "bg-pink-100 group-hover:bg-pink-200"
                      }`}>
                        <Zap size={17} className={openSections.engagement ? "text-white" : "text-pink-600"} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">Engagement</span>
                      <Badge {...lvl(engagement.score)} />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-pink-600 group-hover:text-pink-700">
                        {openSections.engagement ? "Hide Details" : "Show Details"}
                      </span>
                      <ChevronDown size={18} className={`text-pink-600 transition-transform duration-300 ${
                        openSections.engagement ? "rotate-180" : ""
                      }`} />
                    </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openSections.engagement 
                      ? "max-h-96 opacity-100" 
                      : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-5 pb-4 pt-1 bg-white border-t border-slate-100">
                      <MetricRow label="Gesture Engagement" value={gestureFreq != null ? `${gestureFreq.toFixed(0)}%` : null}
                        tooltip={{ what: "Active use of hand/body gestures", why: "Gestures add energy to delivery", ideal: "10–40%" }} />
                      <MetricRow label="Confidence Estimate" value={confEstimate != null ? confEstimate.toFixed(1) : null} unit="/100" badge={lvl(confEstimate)}
                        tooltip={{ what: "AI-estimated confidence from visual + audio cues", why: "Confidence impacts how your message is received", ideal: "70+" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Navigation ──────────────────────────────── */}
          <div className="flex flex-wrap gap-2.5 pb-8">
            <button onClick={() => router.push(`/reports/${sessionId}`)} className="btn-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all">
              <FileText size={15} /> View Full Report
            </button>
            <button onClick={() => router.push("/my-videos")} className="glass text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:shadow-md transition-all">
              Back to Videos
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
