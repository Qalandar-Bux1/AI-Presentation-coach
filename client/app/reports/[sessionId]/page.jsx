"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Loader2, AlertCircle, ArrowLeft, Calendar, FileText, Download } from "lucide-react";

export default function ReportDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const sessionId = params?.sessionId;

	const [report, setReport] = useState(null);
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [downloading, setDownloading] = useState(false);
	const reportRef = useRef(null);

	const escapeHtml = (value = "") =>
		String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");

	useEffect(() => {
		if (!sessionId) {
			setError("Session ID is required");
			setLoading(false);
			return;
		}

		const fetchReport = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setError("Please log in to view feedback");
					setLoading(false);
					return;
				}

				const res = await fetch(`http://localhost:5000/session/${sessionId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data?.error || "Failed to fetch session");
				}

				const data = await res.json();
				const sessionData = data.session;
				setSession(sessionData);

				if (sessionData.analysis_status === "processing") {
					throw new Error("Analysis is still in progress. Please wait for it to complete.");
				}

				if (sessionData.analysis_status === "failed") {
					throw new Error(sessionData.analysis_error || "Analysis failed for this session.");
				}

				if (sessionData.analysis_report) {
					setReport(sessionData.analysis_report);
				} else if (sessionData.feedback) {
					setReport({
						scores: {
							final_score: sessionData.score || 0,
							grade: sessionData.grade || "N/A",
							breakdown: {
								voice_delivery: { score: 0 },
								content_quality: { score: 0 },
								confidence_body_language: { score: 0 },
								engagement: { score: 0 },
							},
						},
						feedback: sessionData.feedback,
					});
				} else {
					throw new Error("No feedback report found for this session.");
				}
			} catch (err) {
				setError(err.message || "Failed to load feedback report");
			} finally {
				setLoading(false);
			}
		};

		fetchReport();
	}, [sessionId]);

	const handleDownload = async () => {
		if (!reportRef.current || downloading) return;

		try {
			setDownloading(true);
			const html2pdfModule = await import("html2pdf.js");
			const html2pdf = html2pdfModule.default || html2pdfModule;
			const safeTitle = (session?.title || `feedback-${sessionId}`).replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

			const audio = report?.audio_analysis || {};
			const video = report?.video_analysis || {};
			const wpm = audio?.speaking_speed?.wpm;
			const fillerPct = audio?.filler_words?.percentage;
			const fillerTotal = audio?.filler_words?.total;
			const facePresence = video?.face_presence?.percentage;
			const gestureFreq = video?.gestures?.frequency_percentage;

			const exportNode = document.createElement("div");
			// Match A4 portrait width in CSS pixels (96dpi) so export fills the page
			exportNode.style.width = "794px";
			exportNode.style.background = "#f4f8fb";
			exportNode.style.padding = "16px";
			exportNode.style.fontFamily = "Inter, Arial, sans-serif";
			exportNode.style.boxSizing = "border-box";
			exportNode.style.margin = "0 auto";
			exportNode.innerHTML = `
				<div style="background:linear-gradient(145deg,#113a4b 0%,#061824 100%);color:#fff;border-radius:16px;padding:18px;margin-bottom:12px;">
					<div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#cbd5e1;margin-bottom:8px;">AI Feedback Report</div>
					<div style="font-size:26px;font-weight:800;line-height:1.2;word-break:break-word;">${escapeHtml(title)}</div>
					<div style="font-size:13px;color:#cbd5e1;margin-top:8px;">${escapeHtml(analysisDate ? new Date(analysisDate).toLocaleString() : "—")}</div>
				</div>
				${
					[wpm, fillerPct, fillerTotal, facePresence, gestureFreq].some((v) => v != null)
						? `
				<div style="background:#fff;border:1px solid #dbe4ee;border-radius:14px;padding:12px;margin-bottom:10px;">
					<div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin-bottom:8px;">Key Metrics (raw values)</div>
					<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
						${wpm != null ? `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;">
							<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Speaking speed</div>
							<div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">${escapeHtml(wpm)} WPM</div>
						</div>` : ``}
						${fillerTotal != null || fillerPct != null ? `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;">
							<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Filler words</div>
							<div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">
								${escapeHtml(fillerTotal != null ? fillerTotal : "—")}
								<span style="font-size:12px;font-weight:700;color:#64748b;">${fillerPct != null ? ` • ${Number(fillerPct).toFixed(1)}%` : ""}</span>
							</div>
						</div>` : ``}
						${facePresence != null ? `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;">
							<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Face presence</div>
							<div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">${Number(facePresence).toFixed(0)}%</div>
						</div>` : ``}
						${gestureFreq != null ? `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;">
							<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Gestures</div>
							<div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:4px;">${Number(gestureFreq).toFixed(0)}%</div>
						</div>` : ``}
					</div>
				</div>
				`
						: ``
				}
				<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px;">
					<div style="background:#fff;border:1px solid #dbe4ee;border-radius:12px;padding:12px;">
						<div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">Key Strengths</div>
						<div style="font-size:24px;font-weight:800;color:#059669;margin-top:6px;">${strengths.length}</div>
						<div style="font-size:11px;color:#64748b;margin-top:6px;">What you should keep doing consistently.</div>
					</div>
					<div style="background:#fff;border:1px solid #dbe4ee;border-radius:12px;padding:12px;">
						<div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">Items to Focus</div>
						<div style="font-size:24px;font-weight:800;color:#d97706;margin-top:6px;">${improvements.length}</div>
						<div style="font-size:11px;color:#64748b;margin-top:6px;">The highest-impact areas for your next attempt.</div>
					</div>
					<div style="background:#fff;border:1px solid #dbe4ee;border-radius:12px;padding:12px;">
						<div style="font-size:11px;color:#64748b;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">Overall Result</div>
						<div style="display:flex;align-items:flex-end;gap:6px;margin-top:6px;">
							<div style="font-size:24px;font-weight:800;color:#0f172a;">${finalScore != null ? Math.round(finalScore) : "—"}</div>
							<div style="font-size:12px;color:#64748b;">${escapeHtml(grade)}</div>
						</div>
						<div style="font-size:11px;color:#64748b;margin-top:6px;">A quick quality snapshot of your presentation.</div>
					</div>
				</div>
				<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
					<div style="background:linear-gradient(180deg,#ecfdf5 0%,#fff 100%);border:1px solid #a7f3d0;border-radius:14px;padding:14px;">
						<div style="font-size:20px;font-weight:800;color:#065f46;margin-bottom:6px;">Key Strengths</div>
						<div style="font-size:13px;color:#047857;margin-bottom:10px;">These are working well. Keep them consistent in every presentation.</div>
						<ul style="margin:0;padding-left:18px;color:#064e3b;font-size:13px;line-height:1.6;word-break:break-word;">
							${(strengths.length ? strengths : ["Keep practicing to reveal your strengths."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
						</ul>
					</div>
					<div style="background:linear-gradient(180deg,#fffbeb 0%,#fff 100%);border:1px solid #fde68a;border-radius:14px;padding:14px;">
						<div style="font-size:20px;font-weight:800;color:#92400e;margin-bottom:6px;">Items to Focus</div>
						<div style="font-size:13px;color:#b45309;margin-bottom:10px;">Improve these one by one to get visible score growth.</div>
						<ul style="margin:0;padding-left:18px;color:#78350f;font-size:13px;line-height:1.6;word-break:break-word;">
							${(improvements.length ? improvements : ["Great progress so far. Maintain consistency."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
						</ul>
					</div>
				</div>
			`;
			await html2pdf()
				.set({
					margin: [0, 0, 0, 0],
					filename: `${safeTitle}.pdf`,
					image: { type: "jpeg", quality: 0.98 },
					html2canvas: {
						scale: 2,
						useCORS: true,
						backgroundColor: "#f8fafc",
						onclone: (clonedDoc) => {
							clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
							const baseStyle = clonedDoc.createElement("style");
							baseStyle.textContent = `
								* { box-sizing: border-box; }
								body { margin: 0; background: #ffffff; color: #0f172a; }
							`;
							clonedDoc.head.appendChild(baseStyle);
						},
					},
					jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
					pagebreak: { mode: ["avoid-all", "css", "legacy"] },
				})
				.from(exportNode)
				.save();
		} catch (downloadError) {
			console.error("Failed to download report:", downloadError);
			window.alert("Unable to download the feedback report right now. Please try again.");
		} finally {
			setDownloading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen">
				<Sidebar />
				<main className="flex-1 ml-64 flex items-center justify-center">
					<div className="text-center">
						<Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
						<p className="text-slate-500 text-sm">Loading feedback…</p>
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
						<button
							onClick={() => router.push("/my-videos")}
							className="btn-gradient text-white px-5 py-2 rounded-xl text-sm font-medium"
						>
							Back to Videos
						</button>
					</div>
				</main>
			</div>
		);
	}

	if (!report) {
		return null;
	}

	const feedback = report.feedback || {};
	const strengths = feedback.strengths || [];
	const improvements = feedback.improvements || [];
	const title = session?.title || "Feedback Report";
	const analysisDate = session?.analyzed_at || session?.created_at || session?.start_time;
	const finalScore = report?.scores?.final_score ?? report?.scores?.overall ?? null;
	const grade = report?.scores?.grade || report?.scores?.rating || "Unrated";

	return (
		<div className="flex min-h-screen">
			<Sidebar />

			<main className="flex-1 ml-64 p-4 sm:p-6 lg:p-7">
				<div className="max-w-6xl 2xl:max-w-7xl mx-auto space-y-6">
					<div className="rounded-3xl p-5 lg:p-6 relative overflow-hidden text-white" style={{ background: "linear-gradient(145deg, #113a4b 0%, #061824 100%)" }}>
						<div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-sky-300/15 blur-3xl"></div>
						<div className="relative flex flex-wrap items-start justify-between gap-6">
							<div>
								<button
									onClick={() => router.push(`/results/${sessionId}`)}
									className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-white/70"
								>
									<ArrowLeft size={16} />
									Back to Results
								</button>

								<div className="flex items-center gap-3 mb-2">
									<div className="p-3 rounded-2xl bg-white/10 border border-white/20">
										<FileText className="text-white" size={22} />
									</div>
									<div>
										<h1 className="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
										<p className="text-slate-200 mt-1.5 max-w-2xl text-sm">
											Your personalized feedback snapshot. Keep your strengths, focus on key improvements, and grow confidence with each session.
										</p>
										<div className="flex items-center gap-2 text-sm text-slate-200 mt-2">
											<Calendar size={14} />
											<span>{analysisDate ? new Date(analysisDate).toLocaleString() : "—"}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="flex flex-col items-stretch gap-3 min-w-[200px]" data-html2canvas-ignore="true">
								<button
									onClick={handleDownload}
									disabled={downloading}
									className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-70"
									style={{ background: "linear-gradient(135deg, #1f4959 0%, #011425 100%)", boxShadow: "0 14px 28px rgba(1, 20, 37, 0.35)" }}
								>
									{downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
									{downloading ? "Preparing Report..." : "Download Report"}
								</button>
							</div>
						</div>
					</div>

					<div ref={reportRef} id="export-report-root" className="space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
							<div className="glass rounded-xl p-3.5 h-fit">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Key Strengths</p>
								<p className="text-2xl font-bold text-emerald-600 leading-none">{strengths.length}</p>
								<p className="text-xs text-slate-500 mt-2 leading-5">What you should keep doing consistently.</p>
							</div>
							<div className="glass rounded-xl p-3.5 h-fit">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Items to Focus</p>
								<p className="text-2xl font-bold text-amber-600 leading-none">{improvements.length}</p>
								<p className="text-xs text-slate-500 mt-2 leading-5">The highest-impact areas for your next attempt.</p>
							</div>
							<div className="glass rounded-xl p-3.5 h-fit">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Overall Result</p>
								<div className="flex items-end gap-2">
									<p className="text-2xl font-bold text-slate-800 leading-none">{finalScore != null ? Math.round(finalScore) : "—"}</p>
									<span className="text-xs text-slate-500 pb-0.5">{grade}</span>
								</div>
								<p className="text-xs text-slate-500 mt-2 leading-5">A quick quality snapshot of your presentation.</p>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
							<div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
								<h2 className="text-xl font-bold text-emerald-800 mb-3">Key Strengths</h2>
								<p className="text-sm text-emerald-700 mb-4">These are working well. Keep them consistent in every presentation.</p>
								<ul className="space-y-2.5">
									{strengths.length > 0 ? strengths.map((item, index) => (
										<li key={index} className="text-sm text-emerald-900 leading-6">• {item}</li>
									)) : <li className="text-sm text-emerald-700">• Keep practicing to reveal your strengths.</li>}
								</ul>
							</div>

							<div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
								<h2 className="text-xl font-bold text-amber-800 mb-3">Items to Focus</h2>
								<p className="text-sm text-amber-700 mb-4">Improve these one by one to get visible score growth.</p>
								<ul className="space-y-2.5">
									{improvements.length > 0 ? improvements.map((item, index) => (
										<li key={index} className="text-sm text-amber-900 leading-6">• {item}</li>
									)) : <li className="text-sm text-amber-700">• Great progress so far. Maintain consistency.</li>}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
