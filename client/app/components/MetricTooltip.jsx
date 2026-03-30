"use client";

import React from "react";
import { Info } from "lucide-react";

export default function MetricTooltip({ what, why, ideal, interpretation }) {
	const hasAny = Boolean(what || why || ideal || interpretation);
	if (!hasAny) return null;

	return (
		<span className="relative inline-flex items-center align-middle group">
			<span
				className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700 transition-colors"
				role="button"
				tabIndex={0}
				aria-label="Metric info"
			>
				<Info size={12} />
			</span>

			<span className="pointer-events-none absolute right-0 top-full mt-2 w-72 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150 z-50">
				<span className="block rounded-xl border border-slate-200 bg-white shadow-lg p-3">
					{what && (
						<span className="block mb-2">
							<span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">What</span>
							<span className="block text-[13px] text-slate-700 leading-snug">{what}</span>
						</span>
					)}
					{why && (
						<span className="block mb-2">
							<span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Why</span>
							<span className="block text-[13px] text-slate-700 leading-snug">{why}</span>
						</span>
					)}
					{ideal && (
						<span className="block mb-2">
							<span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Ideal</span>
							<span className="block text-[13px] text-slate-700 leading-snug">{ideal}</span>
						</span>
					)}
					{interpretation && (
						<span className="block">
							<span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Interpretation</span>
							<span className="block text-[13px] text-slate-700 leading-snug">{interpretation}</span>
						</span>
					)}
				</span>
			</span>
		</span>
	);
}
