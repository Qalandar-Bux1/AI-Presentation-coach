"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ScoreRing from "../../components/ScoreRing";
import "../../components/bg.css";
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle, Target,
  TrendingUp, Volume2, FileText, User, Zap, Download,
  MessageSquare, ChevronDown
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ─── Helpers ────────────────────────────────────────────── */
const lvl = (s) => {
  if (s == null) return { label: "N/A", color: "#94a3b8" };
  if (s >= 80) return { label: "Excellent", color: "#059669" };
  if (s >= 70) return { label: "Good", color: "#16a34a" };
  if (s >= 50) return { label: "Average", color: "#d97706" };
  return { label: "Needs Work", color: "#dc2626" };
};

const gradeColor = (g) => {
  if (!g) return { text: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
  if (g.startsWith("A") || g === "Excellent") return { text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
  if (g.startsWith("B") || g === "Good" || g === "Very Good") return { text: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
  if (g.startsWith("C") || g === "Fair") return { text: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  return { text: "text-red-700", bg: "bg-red-50 border-red-200" };
};

/* ─── Main Component ─────────────────────────────────────── */
export default function ReportsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId;

  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* ── Fetch (unchanged API logic) ────────────────────────── */
  useEffect(() => {
    if (!sessionId) { setError("Session ID is required"); setLoading(false); return; }

    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Please log in to view reports"); setLoading(false); return; }

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
        if (analysisStatus === "processing") { setError("Analysis is still in progress. Please wait."); setLoading(false); return; }
        if (analysisStatus === "failed") { setError(`Analysis failed: ${sessionData.analysis_error || "Unknown error"}`); setLoading(false); return; }
        if (analysisStatus === "completed_with_warning") {
          toast.warning(sessionData.warning_message || sessionData.analysis_report?.warning_message || "Analysis completed with limitations");
        }

        if (!sessionData.analysis_report && !sessionData.feedback) { setError("Analysis report not found."); setLoading(false); return; }

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

  /* ── PDF Download ───────────────────────────────────────── */
  const handleDownload = async () => {
    const element = document.getElementById("report-pdf-content");
    if (!element) return;

    setDownloading(true);
    element.style.display = "block";

    const opt = {
      margin: [0.4, 0.5, 0.4, 0.5],
      filename: `presentation_report_${sessionId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    } finally {
      element.style.display = "none";
      setDownloading(false);
    }
  };

  /* ── Loading / Error / No-report states ─────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading report…</p>
          </div>
        </main>
      </div>
    );
  }

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

  if (!report) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center p-8">
          <div className="glass rounded-2xl p-8 max-w-md text-center shadow-glass">
            <AlertCircle className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Report Found</h2>
            <p className="text-slate-600 mb-5 text-sm">This session has not been analyzed yet.</p>
            <button onClick={() => router.push("/my-videos")} className="btn-gradient text-white px-5 py-2 rounded-xl text-sm font-medium">
              Back to Videos
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── Extract data ───────────────────────────────────────── */
  const finalScore = report.scores?.final_score;
  const grade = report.scores?.grade || "N/A";
  const rating = report.scores?.rating || grade;
  const hasScore = finalScore != null;

  const voice = report.scores?.breakdown?.voice_delivery;
  const content = report.scores?.breakdown?.content_quality;
  const confidence = report.scores?.breakdown?.confidence_body_language;
  const engagement = report.scores?.breakdown?.engagement;

  const audio = report.audio_analysis || {};
  const txt = report.text_analysis || {};
  const vid = report.video_analysis || {};
  const feedback = report.feedback || {};
  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const overallAssessment = feedback.overall_assessment || "";

  const gc = gradeColor(grade);

  /* ── Category score items for the mini bar ───────────────── */
  const categories = [
    { key: "voice", label: "Voice", score: voice?.score, icon: Volume2, color: "cyan", skipped: voice?.skipped },
    { key: "content", label: "Content", score: content?.score, icon: FileText, color: "blue", skipped: content?.skipped },
    { key: "confidence", label: "Confidence", score: confidence?.score, icon: User, color: "purple", skipped: confidence?.skipped },
    { key: "engagement", label: "Engagement", score: engagement?.score, icon: Zap, color: "pink", skipped: engagement?.skipped },
  ].filter(c => !c.skipped && c.score != null);

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen">
      <ToastContainer />
      <Sidebar />

      <main className="flex-1 ml-64 p-5 lg:p-7 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* ── Header ──────────────────────────────────── */}
          <div className="mb-5">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition-colors">
              <ArrowLeft size={16} /><span>Back</span>
            </button>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Detailed Report</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {session?.title || "Presentation"}
                  {session?.start_time ? ` • ${new Date(session.start_time).toLocaleDateString()}` : ""}
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-gradient text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                {downloading ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>

          {/* ── Warnings ────────────────────────────────── */}
          {(!report?.metadata?.speech_detected || !report?.metadata?.face_detected) && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-amber-700">
                {!report.metadata?.speech_detected && !report.metadata?.face_detected
                  ? "No speech or face detected — feedback is limited."
                  : !report.metadata?.speech_detected
                    ? "No speech detected. Voice & content feedback unavailable."
                    : "No face detected. Visual feedback unavailable."}
              </p>
            </div>
          )}

          {/* ── Compact Score Summary ─────────────────── */}
          <div className="glass rounded-2xl p-5 mb-5 shadow-glass">
            <div className="flex items-center gap-5 flex-wrap">
              {hasScore && <ScoreRing score={finalScore} size={68} strokeWidth={5} />}
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-0.5">Overall Performance</p>
                {hasScore ? (
                  <p className="text-2xl font-bold text-slate-800">{finalScore.toFixed(1)} <span className="text-sm text-slate-400 font-normal">/ 100</span></p>
                ) : (
                  <p className="text-lg font-bold text-slate-500">Not Available</p>
                )}
              </div>
              {hasScore && (
                <div className={`px-3 py-2 rounded-lg border text-center ${gc.bg}`}>
                  <p className={`text-lg font-bold ${gc.text}`}>{rating}</p>
                </div>
              )}
            </div>

            {/* Category mini scores */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-200/50">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const l = lvl(cat.score);
                  return (
                    <div key={cat.key} className="flex items-center gap-1.5 text-xs">
                      <Icon size={13} className={`text-${cat.color}-500`} />
                      <span className="text-slate-600">{cat.label}:</span>
                      <span className="font-bold" style={{ color: l.color }}>{cat.score.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Overall Assessment ────────────────────── */}
          {overallAssessment && (
            <div className="glass rounded-xl p-4 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800">Overall Assessment</h3>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed">{overallAssessment}</p>
            </div>
          )}

          {/* ── Strengths & Focus Items ──────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Key Strengths */}
            <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50/90 via-white/60 to-emerald-50/40 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-800">Key Strengths</h3>
                  <p className="text-[11px] text-emerald-600">What you did well</p>
                </div>
              </div>
              {strengths.length > 0 ? (
                <ul className="space-y-2.5">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={12} className="text-emerald-600" />
                      </span>
                      <span className="text-[13px] text-emerald-900 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-600 italic py-4 text-center">Keep practicing to build more strengths!</p>
              )}
            </div>

            {/* Focus Items */}
            <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50/90 via-white/60 to-red-50/30 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Target size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-800">Focus Items</h3>
                  <p className="text-[11px] text-amber-600">Areas to work on next</p>
                </div>
              </div>
              {improvements.length > 0 ? (
                <ul className="space-y-2.5">
                  {improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 text-[11px] font-bold">!</span>
                      </span>
                      <span className="text-[13px] text-amber-900 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-600 italic py-4 text-center">Outstanding! No major areas for improvement.</p>
              )}
            </div>
          </div>

          {/* ── Collapsible Metrics Summary ──────────── */}
          <div className="glass rounded-xl overflow-hidden mb-5 border-2 border-blue-200/40 shadow-md hover:shadow-lg transition-all">
            <button onClick={() => setShowMetrics(!showMetrics)} className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 text-left cursor-pointer ${showMetrics ? "bg-blue-50/50" : "hover:bg-white/70 active:bg-white/60"}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp size={16} className="text-blue-500" />
                </div>
                <span className="text-sm font-bold text-slate-800">Detailed Metrics</span>
              </div>
              <ChevronDown size={18} className={`text-blue-500 transition-transform duration-300 ${showMetrics ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${showMetrics ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Voice */}
                {!voice?.skipped && voice?.score != null && (
                  <div className="p-3 rounded-lg bg-cyan-50/50 border border-cyan-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 size={14} className="text-cyan-600" />
                      <span className="text-xs font-bold text-slate-800">Voice & Delivery</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: lvl(voice.score).color }}>{voice.score.toFixed(0)}/100</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between"><span>Speed</span><span className="font-medium text-slate-800">{audio.speaking_speed?.wpm ?? "—"} WPM</span></div>
                      <div className="flex justify-between"><span>Fillers</span><span className="font-medium text-slate-800">{audio.filler_words?.total ?? "—"} ({audio.filler_words?.percentage != null ? `${audio.filler_words.percentage.toFixed(1)}%` : "—"})</span></div>
                      <div className="flex justify-between"><span>Pitch Stability</span><span className="font-medium text-slate-800">{audio.pitch?.stability_score?.toFixed(0) ?? "—"}/100</span></div>
                    </div>
                  </div>
                )}
                {/* Content */}
                {!content?.skipped && content?.score != null && (
                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">Content Quality</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: lvl(content.score).color }}>{content.score.toFixed(0)}/100</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between"><span>Grammar</span><span className="font-medium text-slate-800">{txt.grammar?.score?.toFixed(0) ?? "—"}/100</span></div>
                      <div className="flex justify-between"><span>Repetition</span><span className="font-medium text-slate-800">{txt.repetition?.repetition_score?.toFixed(0) ?? "—"}/100</span></div>
                      <div className="flex justify-between"><span>Words</span><span className="font-medium text-slate-800">{txt.word_count || "—"}</span></div>
                    </div>
                  </div>
                )}
                {/* Confidence */}
                {!confidence?.skipped && confidence?.score != null && (
                  <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-purple-600" />
                      <span className="text-xs font-bold text-slate-800">Confidence</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: lvl(confidence.score).color }}>{confidence.score.toFixed(0)}/100</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between"><span>Eye Contact</span><span className="font-medium text-slate-800">{vid.eye_contact?.score?.toFixed(0) ?? "—"}/100</span></div>
                      <div className="flex justify-between"><span>Posture</span><span className="font-medium text-slate-800">{vid.posture?.score?.toFixed(0) ?? "—"}/100</span></div>
                      <div className="flex justify-between"><span>Face Visible</span><span className="font-medium text-slate-800">{vid.face_presence?.percentage?.toFixed(0) ?? "—"}%</span></div>
                    </div>
                  </div>
                )}
                {/* Engagement */}
                {!engagement?.skipped && engagement?.score != null && (
                  <div className="p-3 rounded-lg bg-pink-50/50 border border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-pink-600" />
                      <span className="text-xs font-bold text-slate-800">Engagement</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: lvl(engagement.score).color }}>{engagement.score.toFixed(0)}/100</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between"><span>Confidence Est.</span><span className="font-medium text-slate-800">{vid.confidence_estimate?.toFixed(0) ?? "—"}/100</span></div>
                      <div className="flex justify-between"><span>Gestures</span><span className="font-medium text-slate-800">{vid.gestures?.frequency_percentage?.toFixed(0) ?? "—"}%</span></div>
                      <div className="flex justify-between"><span>Vol. Variation</span><span className="font-medium text-slate-800">{audio.volume?.std_db?.toFixed(1) ?? "—"} dB</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Navigation ──────────────────────────────── */}
          <div className="flex flex-wrap gap-2.5 pb-8">
            <button onClick={() => router.push(`/results/${sessionId}`)} className="btn-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all">
              <TrendingUp size={15} /> View Score Breakdown
            </button>
            <button onClick={handleDownload} disabled={downloading} className="glass text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60">
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {downloading ? "Generating…" : "Download Report"}
            </button>
            <button onClick={() => router.push("/my-videos")} className="glass text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:shadow-md transition-all">
              Back to Videos
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────── */}
        {/* ── Professional PDF Content (hidden) ───────────── */}
        {/* ───────────────────────────────────────────────── */}
        <div id="report-pdf-content" style={{
          display: "none",
          maxWidth: "750px",
          margin: "0 auto",
          padding: "40px 50px",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontSize: "13px",
          lineHeight: "1.6",
        }}>
          {/* PDF Header with gradient bar */}
          <div style={{
            marginBottom: "28px",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}>
            <div style={{
              height: "4px",
              width: "100%",
              borderRadius: "2px",
              marginBottom: "20px",
              background: "linear-gradient(90deg, #00D9FF 0%, #3B82F6 50%, #8B5CF6 100%)",
            }} />
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
            }}>
              <div style={{ flex: "1 1 60%" }}>
                <h1 style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                  lineHeight: "1.2",
                }}>
                  Presentation Analysis Report
                </h1>
                <p style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: 0,
                  lineHeight: "1.4",
                }}>
                  {session?.title || "Untitled Presentation"} • {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div style={{
                padding: "10px 18px",
                borderRadius: "10px",
                textAlign: "center",
                background: "linear-gradient(135deg, #00D9FF 0%, #3B82F6 100%)",
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.95)",
                  display: "block",
                  fontWeight: "700",
                  marginBottom: "2px",
                }}>AI Coach</span>
                <span style={{
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.8)",
                  display: "block",
                }}>Presentation Mastery</span>
              </div>
            </div>
          </div>

          {/* PDF Overall Score */}
          <div style={{
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "28px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "1px solid #e2e8f0",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}>
              <div style={{ flex: "0 0 auto" }}>
                <p style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "#64748b",
                  fontWeight: "700",
                  marginBottom: "6px",
                  margin: "0 0 6px 0",
                }}>Overall Score</p>
                <p style={{
                  fontSize: "44px",
                  fontWeight: "800",
                  color: "#2563eb",
                  margin: 0,
                  lineHeight: "1",
                }}>{finalScore?.toFixed(1) ?? "N/A"}</p>
                <p style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  margin: "4px 0 0 0",
                }}>out of 100</p>
              </div>
              
              <div style={{
                width: "1px",
                height: "60px",
                backgroundColor: "#cbd5e1",
                flexShrink: 0,
              }} />
              
              <div style={{ flex: "0 0 auto" }}>
                <p style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "#64748b",
                  fontWeight: "700",
                  marginBottom: "6px",
                  margin: "0 0 6px 0",
                }}>Grade</p>
                <p style={{
                  fontSize: "34px",
                  fontWeight: "800",
                  color: "#334155",
                  margin: 0,
                  lineHeight: "1",
                }}>{rating}</p>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: "4px 0 0 0",
                }}>{grade}</p>
              </div>
              
              <div style={{
                marginLeft: "auto",
                flex: "1 1 auto",
                minWidth: "200px",
              }}>
                <p style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "#64748b",
                  fontWeight: "700",
                  marginBottom: "10px",
                  margin: "0 0 10px 0",
                }}>Categories</p>
                <div style={{
                  display: "flex",
                  gap: "14px",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                }}>
                  {[
                    { l: "Voice", s: voice?.score, c: "#00D9FF" },
                    { l: "Content", s: content?.score, c: "#3B82F6" },
                    { l: "Confidence", s: confidence?.score, c: "#8B5CF6" },
                    { l: "Engagement", s: engagement?.score, c: "#EC4899" },
                  ].filter(c => c.s != null).map(c => (
                    <div key={c.l} style={{
                      textAlign: "center",
                      flex: "0 0 auto",
                    }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#fff",
                        backgroundColor: c.c,
                        margin: "0 auto",
                      }}>{c.s.toFixed(0)}</div>
                      <p style={{
                        fontSize: "9px",
                        color: "#64748b",
                        marginTop: "4px",
                        margin: "4px 0 0 0",
                      }}>{c.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PDF Strengths & Improvements */}
          <div style={{
            marginBottom: "28px",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}>
              <div style={{
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #bbf7d0",
                backgroundColor: "#f0fdf4",
                boxSizing: "border-box",
              }}>
                <h3 style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#166534",
                  marginBottom: "12px",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{
                    display: "inline-block",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }} />
                  <span>Key Strengths</span>
                </h3>
                <ul style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#15803d",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}>
                  {strengths.length > 0 ? strengths.map((s, i) => (
                    <li key={i} style={{
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}>{s}</li>
                  )) : <li style={{
                    color: "#6b7280",
                    fontStyle: "italic",
                    listStyleType: "none",
                    marginLeft: "-20px",
                  }}>No specific strengths identified</li>}
                </ul>
              </div>
              
              <div style={{
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #fed7aa",
                backgroundColor: "#fffbeb",
                boxSizing: "border-box",
              }}>
                <h3 style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#92400e",
                  marginBottom: "12px",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{
                    display: "inline-block",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor: "#f59e0b",
                    flexShrink: 0,
                  }} />
                  <span>Focus Items</span>
                </h3>
                <ul style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#b45309",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}>
                  {improvements.length > 0 ? improvements.map((s, i) => (
                    <li key={i} style={{
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}>{s}</li>
                  )) : <li style={{
                    color: "#6b7280",
                    fontStyle: "italic",
                    listStyleType: "none",
                    marginLeft: "-20px",
                  }}>No areas for improvement identified</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* PDF Detailed Metrics */}
          <div style={{
            marginBottom: "28px",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "16px",
              margin: "0 0 16px 0",
              paddingBottom: "10px",
              borderBottom: "2px solid #e2e8f0",
            }}>Detailed Metrics</h2>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}>
              {/* Voice */}
              {voice?.score != null && (
                <div style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  backgroundColor: "#fff",
                  borderTop: "3px solid #00D9FF",
                  boxSizing: "border-box",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "12px",
                    margin: "0 0 12px 0",
                  }}>Voice & Delivery — {voice.score.toFixed(0)}/100</h3>
                  <div style={{
                    fontSize: "11px",
                    color: "#334155",
                    lineHeight: "1.6",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Speaking Speed</span><span style={{ fontWeight: "600" }}>{audio.speaking_speed?.wpm ?? "—"} WPM</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Filler Words</span><span style={{ fontWeight: "600" }}>{audio.filler_words?.total ?? 0} ({audio.filler_words?.percentage?.toFixed(1) ?? "0"}%)</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Pitch Stability</span><span style={{ fontWeight: "600" }}>{audio.pitch?.stability_score?.toFixed(0) ?? "—"}/100</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: 0,
                    }}><span>Volume Stability</span><span style={{ fontWeight: "600" }}>{audio.volume?.stability_score?.toFixed(0) ?? "—"}/100</span></div>
                  </div>
                </div>
              )}
              
              {/* Content */}
              {content?.score != null && (
                <div style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  backgroundColor: "#fff",
                  borderTop: "3px solid #3B82F6",
                  boxSizing: "border-box",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "12px",
                    margin: "0 0 12px 0",
                  }}>Content Quality — {content.score.toFixed(0)}/100</h3>
                  <div style={{
                    fontSize: "11px",
                    color: "#334155",
                    lineHeight: "1.6",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Grammar</span><span style={{ fontWeight: "600" }}>{txt.grammar?.score?.toFixed(0) ?? "—"}/100</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Repetition</span><span style={{ fontWeight: "600" }}>{txt.repetition?.repetition_score?.toFixed(0) ?? "—"}/100</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Word Count</span><span style={{ fontWeight: "600" }}>{txt.word_count || "—"}</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: 0,
                      flexWrap: "wrap",
                      gap: "4px",
                    }}>
                      <span>Structure</span>
                      <span style={{
                        fontWeight: "600",
                        fontSize: "10px",
                      }}>
                        {txt.structure?.has_intro ? "✓ Intro" : "✗ Intro"} · {txt.structure?.has_body ? "✓ Body" : "✗ Body"} · {txt.structure?.has_conclusion ? "✓ End" : "✗ End"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Confidence */}
              {confidence?.score != null && (
                <div style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  backgroundColor: "#fff",
                  borderTop: "3px solid #8B5CF6",
                  boxSizing: "border-box",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "12px",
                    margin: "0 0 12px 0",
                  }}>Confidence — {confidence.score.toFixed(0)}/100</h3>
                  <div style={{
                    fontSize: "11px",
                    color: "#334155",
                    lineHeight: "1.6",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Eye Contact</span><span style={{ fontWeight: "600" }}>{vid.eye_contact?.score?.toFixed(0) ?? "—"}/100</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Posture</span><span style={{ fontWeight: "600" }}>{vid.posture?.score?.toFixed(0) ?? "—"}/100</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Face Visible</span><span style={{ fontWeight: "600" }}>{vid.face_presence?.percentage?.toFixed(0) ?? "—"}%</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: 0,
                    }}><span>Gestures</span><span style={{ fontWeight: "600" }}>{vid.gestures?.frequency_percentage?.toFixed(0) ?? "—"}%</span></div>
                  </div>
                </div>
              )}
              
              {/* Engagement */}
              {engagement?.score != null && (
                <div style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "16px",
                  backgroundColor: "#fff",
                  borderTop: "3px solid #EC4899",
                  boxSizing: "border-box",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}>
                  <h3 style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "12px",
                    margin: "0 0 12px 0",
                  }}>Engagement — {engagement.score.toFixed(0)}/100</h3>
                  <div style={{
                    fontSize: "11px",
                    color: "#334155",
                    lineHeight: "1.6",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Confidence Est.</span><span style={{ fontWeight: "600" }}>{vid.confidence_estimate?.toFixed(0) ?? "—"}/100</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      margin: "0 0 6px 0",
                    }}><span>Gestures</span><span style={{ fontWeight: "600" }}>{vid.gestures?.frequency_percentage?.toFixed(0) ?? "—"}%</span></div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: 0,
                    }}><span>Volume Var.</span><span style={{ fontWeight: "600" }}>{audio.volume?.std_db?.toFixed(1) ?? "—"} dB</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PDF Assessment */}
          {overallAssessment && (
            <div style={{
              padding: "16px 18px",
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: "28px",
              margin: "0 0 28px 0",
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}>
              <h3 style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "8px",
                margin: "0 0 8px 0",
              }}>Overall Assessment</h3>
              <p style={{
                fontSize: "12px",
                color: "#475569",
                margin: 0,
                lineHeight: "1.65",
              }}>{overallAssessment}</p>
            </div>
          )}

          {/* PDF Footer */}
          <div style={{
            marginTop: "36px",
            margin: "36px 0 0 0",
            textAlign: "center",
            paddingTop: "18px",
            borderTop: "1px solid #e2e8f0",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}>
            <div style={{
              height: "3px",
              width: "70px",
              margin: "0 auto 12px",
              borderRadius: "2px",
              background: "linear-gradient(90deg, #00D9FF, #8B5CF6)",
            }} />
            <p style={{
              fontSize: "11px",
              color: "#94a3b8",
              margin: 0,
              lineHeight: "1.5",
            }}>
              Generated by AI Presentation Coach • {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
