import {
	AlertTriangle,
	BarChart3,
	CheckCircle2,
	Clock,
	Crosshair,
	FileText,
	Globe,
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
import type { AnalysisResponse, PromptInputs, Translation } from './types';

interface DashboardViewProps {
	t: Translation;
	resultData: AnalysisResponse;
	promptInputs: PromptInputs;
}

const DashboardView = ({ t, resultData, promptInputs }: DashboardViewProps) => {
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
					<p className="max-w-xl text-gray-400">{promptInputs.thesis || 'Independent automated analysis.'}</p>
				</div>
				<div className="mt-4 text-right md:mt-0">
					<div className="mb-1 text-sm uppercase tracking-widest text-gray-500">{t.confidence}</div>
					<div className="font-mono text-2xl">{resultData?.confidence}</div>
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
								<YAxis axisLine={false} stroke="#666" tick={{ fill: '#666' }} />
								<Tooltip
									contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
									itemStyle={{ color: '#fff' }}
								/>
								<Area
									type="monotone"
									dataKey="revenue"
									name="Revenue"
									stroke="#10b981"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorRev)"
								/>
								<Area
									type="monotone"
									dataKey="ebitda"
									name="EBITDA"
									stroke="#3b82f6"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorEbit)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="col-span-12 flex flex-col rounded-2xl border border-white/5 bg-[#111] p-6 md:col-span-4 md:row-span-2">
					<h3 className="mb-6 flex items-center gap-2 text-lg font-medium">
						<span className="block h-6 w-1 bg-blue-500" />
						{t.valMatrix}
					</h3>
					<div className="flex flex-1 flex-col justify-center gap-6">
						{resultData?.valuation?.map((item) => (
							<div key={item.metric} className="group">
								<div className="mb-2 flex items-end justify-between">
									<span className="text-sm text-gray-400">{item.metric}</span>
									<span className="font-mono text-xl font-bold transition-colors group-hover:text-emerald-400">
										{item.value}x
									</span>
								</div>
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
						))}
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
						<div className="relative z-10 flex flex-col gap-8 md:flex-row">
							<div className="flex-1">
								<div className="mb-4 flex items-center gap-3">
									<Crosshair className="h-8 w-8" />
									<h2 className="font-serif text-3xl font-bold tracking-tight">{t.verdictTitle}</h2>
								</div>
								<h3 className="mb-4 text-5xl font-black tracking-tighter uppercase">
									{resultData.finalRecommendation.action}
								</h3>
								<p className="max-w-3xl text-xl font-light leading-relaxed opacity-90">
									"{resultData.finalRecommendation.justification}"
								</p>
							</div>
							<div className="flex min-w-[250px] flex-col gap-4">
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
