import { type MouseEvent, useEffect, useMemo, useState } from 'react';
import {
	AlertTriangle,
	BarChart3,
	CheckCircle2,
	Clock,
	Crosshair,
	Download,
	FileText,
	Globe,
	Info,
	Target,
	TrendingUp,
	Wallet,
} from 'lucide-react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { getActionColor } from './helpers';
import { generateReportPdf } from './pdfReport';
import type { AnalysisResponse, Language, PromptInputs, Translation } from './types';

interface DashboardViewProps {
	t: Translation;
	resultData: AnalysisResponse;
	promptInputs: PromptInputs;
	language: Language;
}

type UnitKey = 'units' | 'thousands' | 'millions' | 'billions' | 'trillions';

const DashboardView = ({ t, resultData, promptInputs, language }: DashboardViewProps) => {
	const [activeInfo, setActiveInfo] = useState<string | null>(null);

	useEffect(() => {
		if (typeof document === 'undefined') return;
		const handleClick = () => setActiveInfo(null);
		document.addEventListener('click', handleClick);
		return () => {
			document.removeEventListener('click', handleClick);
		};
	}, []);

	const handleDownloadPdf = () => {
		if (!resultData) return;
		generateReportPdf({ resultData, promptInputs, t, language });
	};

	const handleInfoToggle = (event: MouseEvent<HTMLButtonElement>, id: string) => {
		event.stopPropagation();
		setActiveInfo((prev) => (prev === id ? null : id));
	};

	const getMetricDescription = (metric: string) => {
		const normalized = metric.toLowerCase();
		if (normalized.includes('p/e') || normalized.includes('per')) {
			return t.peInfo;
		}
		if (normalized.includes('ev/ebitda')) {
			return t.evInfo;
		}
		if (normalized.includes('p/s') || normalized.includes('price-to-sales')) {
			return t.psInfo;
		}
		return t.valuationMetricFallback;
	};

	const analysisSubtitle = promptInputs.thesis?.trim() || t.analysisSubtitleFallback;
	const locale = language === 'es' ? 'es-ES' : 'en-US';
	const axisFormatter = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				notation: 'compact',
				maximumFractionDigits: 1,
			}),
		[locale],
	);

	const tooltipFormatter = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				maximumFractionDigits: 2,
			}),
		[locale],
	);

	const chartUnitKey = useMemo<UnitKey>(() => {
		if (!resultData?.fundamentals?.length) return 'units';
		const values = resultData.fundamentals.flatMap((entry) => [entry.revenue, entry.ebitda]);
		const maxValue = values.length ? Math.max(...values) : 0;
		if (maxValue >= 1e12) return 'trillions';
		if (maxValue >= 1e9) return 'billions';
		if (maxValue >= 1e6) return 'millions';
		if (maxValue >= 1e3) return 'thousands';
		return 'units';
	}, [resultData?.fundamentals]);

	const translatedUnits: Record<UnitKey, string> = {
		units: t.valueUnitUnits,
		thousands: t.valueUnitThousands,
		millions: t.valueUnitMillions,
		billions: t.valueUnitBillions,
		trillions: t.valueUnitTrillions,
	};

	const chartUnitLabel = `${t.valueUnitPrefix} (${translatedUnits[chartUnitKey]})`;

	const verdictBadge =
		resultData?.verdict && (resultData.verdict.includes('BULL') || resultData.verdict.includes('ALCI'))
			? 'bg-emerald-500 text-black'
			: resultData?.verdict && (resultData.verdict.includes('BEAR') || resultData.verdict.includes('BAJI'))
				? 'bg-red-500 text-white'
				: 'bg-gray-500 text-white';

	return (
		<div className="mx-auto max-w-[1600px] opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
			<div className="mb-12 flex flex-col items-end justify-between border-b border-white/10 pb-6 md:flex-row">
				<div>
					<div className="mb-2 flex items-center gap-4">
						<h1 className="font-serif text-6xl">{promptInputs.ticker}</h1>
						<span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${verdictBadge}`}>
							{resultData?.verdict}
						</span>
					</div>
					<p className="mt-4 max-w-xl text-gray-400">{analysisSubtitle}</p>
					<div className="mt-4 inline-flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400">
						<div className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px]">
							<span className="opacity-70">{t.goalLabel}:</span>{' '}
							<span className="font-semibold normal-case text-white">{promptInputs.goal || t.analysisSubtitleFallback}</span>
						</div>
					</div>
				</div>
				<div className="mt-4 flex flex-col items-end gap-3 text-right md:mt-0">
					<div className="mb-1 text-sm uppercase tracking-widest text-gray-500">{t.confidence}</div>
					<div className="font-mono text-2xl">{resultData?.confidence}</div>
					<button
						type="button"
						onClick={handleDownloadPdf}
						className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white transition hover:border-emerald-400 hover:text-emerald-300"
					>
						<Download size={14} />
						{t.downloadReport}
					</button>
				</div>
			</div>

			<div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-6 md:grid-cols-12">
				<div className="group col-span-12 min-h-[400px] rounded-2xl border border-white/5 bg-[#111] p-6 md:col-span-8 md:row-span-2 relative overflow-hidden">
					<div className="absolute right-0 top-0 p-4 opacity-20 transition-opacity group-hover:opacity-100">
						<BarChart3 size={20} />
					</div>
					<h3 className="mb-6 flex items-center gap-2 text-lg font-medium">
						<span className="block h-6 w-1 bg-emerald-500" />
						{t.chartTitle}
					</h3>
					<div className="mb-6 flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest text-gray-400">
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-emerald-500" />
							{t.revenueLabel}
						</div>
						<div className="relative flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-blue-500" />
							{t.ebitdaLabel}
							<button
								type="button"
								onClick={(event) => handleInfoToggle(event, 'ebitda')}
								className="rounded-full border border-white/20 p-1 text-gray-400 transition hover:border-white/40 hover:text-white"
								aria-label={`${t.ebitdaLabel} info`}
								aria-pressed={activeInfo === 'ebitda'}
							>
								<Info size={14} />
							</button>
							{activeInfo === 'ebitda' && (
								<div className="absolute left-0 top-6 z-20 w-64 rounded-lg border border-white/10 bg-black/80 p-3 text-[11px] leading-snug text-gray-200 shadow-xl">
									{t.ebitdaInfo}
								</div>
							)}
						</div>
						<div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0c0c0c] px-3 py-1 text-[10px] font-semibold normal-case">
							<Info size={12} className="text-emerald-400" />
							<span className="tracking-normal">{chartUnitLabel}</span>
						</div>
					</div>
					<div className="h-[350px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={resultData?.fundamentals}>
								<defs>
									<linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorEbit" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="year" axisLine={false} stroke="#666" tick={{ fill: '#666' }} />
								<YAxis
									axisLine={false}
									stroke="#666"
									tick={{ fill: '#666' }}
									tickFormatter={(value) => axisFormatter.format(value)}
								/>
								<Tooltip
									contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
									itemStyle={{ color: '#fff' }}
									formatter={(value: number, name) => [tooltipFormatter.format(value), name]}
								/>
								<Area
									type="monotone"
									dataKey="revenue"
									name={t.revenueLabel}
									stroke="#10b981"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorRev)"
								/>
								<Area
									type="monotone"
									dataKey="ebitda"
									name={t.ebitdaLabel}
									stroke="#3b82f6"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorEbit)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="col-span-12 flex flex-col rounded-2xl border border-white/5 bg-[#111] p-6 md:col-span-4 md:row-span-2 relative">
					<h3 className="mb-6 flex items-center gap-2 text-lg font-medium">
						<span className="block h-6 w-1 bg-blue-500" />
						{t.valMatrix}
						<button
							type="button"
							onClick={(event) => handleInfoToggle(event, 'val-matrix')}
							className="rounded-full border border-white/20 p-1 text-gray-400 transition hover:border-white/40 hover:text-white"
							aria-label={`${t.valMatrix} info`}
							aria-pressed={activeInfo === 'val-matrix'}
						>
							<Info size={14} />
						</button>
					</h3>
					{activeInfo === 'val-matrix' && (
						<div className="absolute left-6 top-16 z-20 w-64 rounded-lg border border-white/10 bg-black/80 p-3 text-[11px] leading-snug text-gray-200 shadow-xl">
							{t.valMatrixInfo}
						</div>
					)}
					<div className="flex flex-1 flex-col justify-center gap-6">
						{resultData?.valuation?.map((item) => {
							const metricKey = `val-${item.metric.replace(/\s+/g, '-').toLowerCase()}`;
							return (
								<div key={item.metric} className="group relative">
									<div className="mb-2 flex items-end justify-between gap-2">
										<div className="flex items-center gap-2 text-sm text-gray-400">
											<span>{item.metric}</span>
											<button
												type="button"
												onClick={(event) => handleInfoToggle(event, metricKey)}
												className="rounded-full border border-white/20 p-1 text-gray-500 transition hover:border-white/40 hover:text-white"
												aria-label={`${item.metric} info`}
												aria-pressed={activeInfo === metricKey}
											>
												<Info size={12} />
											</button>
										</div>
										<span className="font-mono text-xl font-bold transition-colors group-hover:text-emerald-400">
											{item.value}x
										</span>
									</div>
									{activeInfo === metricKey && (
										<div className="absolute left-0 top-10 z-20 w-60 rounded-lg border border-white/10 bg-black/80 p-3 text-[11px] leading-snug text-gray-200 shadow-xl">
											{getMetricDescription(item.metric)}
										</div>
									)}
									<div className="h-1 w-full rounded-full bg-gray-800">
										<div
											className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
											style={{
												width: `${Math.min((item.value / (item.peerAvg || item.value * 1.5)) * 100, 100)}%`,
											}}
										/>
									</div>
									<div className="mt-1 flex justify-between text-[10px] text-gray-600">
										<span>Co.</span>
										<span>Peer Avg: {item.peerAvg}x</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="col-span-12 rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
					<h3 className="mb-4 flex items-center gap-3 font-serif text-2xl">
						<Globe size={24} className="text-emerald-500" />
						{t.sectorTitle}
					</h3>
					<p className="text-lg font-light leading-relaxed text-gray-300">{resultData?.sectorContext}</p>
				</div>

				<div className="col-span-12 rounded-2xl border border-white/5 bg-[#111] p-8 md:col-span-8">
					<h3 className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4 font-serif text-2xl">
						<FileText size={24} className="text-blue-500" />
						{t.execSummary}
					</h3>
					<ul className="space-y-4">
						{resultData?.summary?.map((point, index) => (
							<li key={`${point}-${index}`} className="flex items-start gap-4 leading-relaxed text-gray-300">
								<CheckCircle2 className="mt-1 shrink-0 text-emerald-500" size={18} />
								<span>{point}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="col-span-12 grid gap-6 md:col-span-4 md:grid-rows-2">
					<div className="rounded-2xl border border-l-4 border-l-amber-500 border-white/5 bg-[#111] p-6 transition-colors hover:border-red-500/30">
						<AlertTriangle className="mb-3 text-amber-500" />
						<h4 className="mb-2 text-sm uppercase tracking-widest text-gray-500">{t.riskTitle}</h4>
						<p className="text-md leading-snug text-gray-200">{resultData?.primaryRisk}</p>
					</div>
					<div className="rounded-2xl border border-l-4 border-l-blue-500 border-white/5 bg-[#111] p-6 transition-colors hover:border-emerald-500/30">
						<Clock className="mb-3 text-blue-500" />
						<h4 className="mb-2 text-sm uppercase tracking-widest text-gray-500">{t.catalystTitle}</h4>
						<p className="text-md leading-snug text-gray-200">{resultData?.nextCatalyst}</p>
					</div>
				</div>

				{resultData?.finalRecommendation && (
					<div
						className={`col-span-12 rounded-2xl border-2 p-8 relative overflow-hidden ${getActionColor(resultData.finalRecommendation.action)}`}
					>
						<div className="relative z-10 flex flex-col gap-8">
							<div className="flex flex-col gap-6 md:grid md:grid-cols-3">
								<div className="md:col-span-1">
									<div className="mb-4 flex items-center gap-3">
										<Crosshair className="h-8 w-8" />
										<h2 className="font-serif text-3xl font-bold tracking-tight">{t.verdictTitle}</h2>
									</div>
									<h3 className="mb-4 text-5xl font-black tracking-tighter uppercase">
										{resultData.finalRecommendation.action}
									</h3>
								</div>
								<div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-lg font-light leading-relaxed text-white/90 backdrop-blur-md md:col-span-2">
									"{resultData.finalRecommendation.justification}"
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
									<div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
										<Target size={14} /> {t.priceTarget}
									</div>
									<div className="font-mono text-2xl font-bold">{resultData.finalRecommendation.priceTarget}</div>
								</div>
								<div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
									<div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
										<Wallet size={14} /> {t.allocLimit}
									</div>
									<div className="font-mono text-2xl font-bold">
										{resultData.finalRecommendation.allocationLimit}
									</div>
								</div>
								<div className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
									<div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
										<TrendingUp size={14} /> {t.entryStrat}
									</div>
									<div className="text-lg font-medium leading-tight">
										{resultData.finalRecommendation.entryStrategy}
									</div>
								</div>
							</div>
						</div>
						<div className="pointer-events-none absolute -right-10 -bottom-10 -rotate-[15deg] text-white/5">
							<Crosshair size={300} strokeWidth={0.5} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardView;
