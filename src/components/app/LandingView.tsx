import { ArrowRight } from 'lucide-react';
import { GOAL_OPTIONS } from './constants';
import type { PromptInputs, Translation } from './types';

interface LandingViewProps {
	t: Translation;
	inputs: PromptInputs;
	error: string;
	onPromptChange: (field: keyof PromptInputs, value: string) => void;
	onSubmit: () => void;
}

const LandingView = ({ t, inputs, error, onPromptChange, onSubmit }: LandingViewProps) => (
	<main className="relative flex min-h-screen flex-col justify-center px-6 pt-20 lg:px-20">
		<div className="relative z-10 mx-auto w-full max-w-7xl">
			<h1 className="mb-12 font-serif text-6xl leading-[0.9] tracking-tight md:text-[8rem]">
				<span className="block opacity-0 animate-[fadeIn_1s_ease-out_forwards]">{t.landingTitle1}</span>
				<span className="block text-transparent opacity-0 animate-[fadeIn_1s_ease-out_0.3s_forwards] md:ml-32 bg-gradient-to-r from-emerald-400 to-emerald-100 bg-clip-text">
					{t.landingTitle2}
				</span>
				<span className="block opacity-0 animate-[fadeIn_1s_ease-out_0.6s_forwards]">{t.landingTitle3}</span>
			</h1>

			<div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
				<div className="hidden text-sm text-gray-500 opacity-0 animate-[slideUp_1s_ease-out_0.9s_forwards] lg:col-span-3 lg:block">
					<p className="border-l border-emerald-500/50 pl-4">{t.landingSubtitle}</p>
					<div className="my-4 h-px w-20 bg-white/20" />
					{error && (
						<div className="rounded border border-red-500/50 bg-red-900/20 p-2 text-xs text-red-400">
							{error}
						</div>
					)}
				</div>

				<div className="relative col-span-12 lg:col-span-6">
					<div className="rounded-t-3xl rounded-bl-3xl rounded-br-sm border border-white/10 bg-[#111]/80 p-8 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:scale-[1.01]">
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<label className="text-xs font-mono uppercase text-emerald-500">{t.tickerLabel}</label>
									<input
										type="text"
										value={inputs.ticker}
										onChange={(e) => onPromptChange('ticker', e.target.value.toUpperCase())}
										placeholder="NVDA"
										className="w-full border-b border-white/20 bg-transparent py-2 font-serif text-2xl uppercase focus:border-emerald-500 focus:outline-none"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-xs font-mono uppercase text-emerald-500">{t.goalLabel}</label>
									<select
										value={inputs.goal}
										onChange={(e) => onPromptChange('goal', e.target.value)}
										className="w-full cursor-pointer appearance-none border-b border-white/20 bg-transparent py-3 text-sm focus:border-emerald-500 focus:outline-none"
									>
										{GOAL_OPTIONS.map((option) => (
											<option key={option.value} value={option.value} className="bg-black">
												{t[option.key]}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-xs font-mono uppercase text-emerald-500">{t.thesisLabel}</label>
								<textarea
									value={inputs.thesis}
									onChange={(e) => onPromptChange('thesis', e.target.value)}
									placeholder={t.thesisPlaceholder}
									className="h-24 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-600 transition-colors focus:border-white/30 focus:outline-none"
								/>
							</div>

							<button
								type="button"
								onClick={onSubmit}
								disabled={!inputs.ticker}
								className="group flex w-full items-center justify-center gap-3 bg-white py-4 text-lg font-bold text-black transition-all duration-300 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<span>{t.btnInitiate}</span>
								<ArrowRight className="transition-transform group-hover:translate-x-1" />
							</button>
						</div>
					</div>
				</div>

				<div className="hidden justify-end opacity-0 animate-[slideUp_1s_ease-out_1.2s_forwards] lg:col-span-3 lg:flex">
					<div className="flex h-40 w-40 items-center justify-center rounded-full border border-dashed border-white/20 animate-[spin_20s_linear_infinite]">
						<div className="h-3 w-3 rounded-full bg-emerald-500" />
					</div>
				</div>
			</div>
		</div>
	</main>
);

export default LandingView;
