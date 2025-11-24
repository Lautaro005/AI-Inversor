import { Cpu, GraduationCap, Languages, Lock, Search, X } from 'lucide-react';
import { PROVIDERS } from './constants';
import type { ApiConfig, ProviderKey, Translation } from './types';

interface SettingsModalProps {
	open: boolean;
	apiConfig: ApiConfig;
	onChange: (config: ApiConfig) => void;
	onProviderChange: (provider: ProviderKey) => void;
	onClose: () => void;
	t: Translation;
}

const SettingsModal = ({ open, apiConfig, onChange, onProviderChange, onClose, t }: SettingsModalProps) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
			<div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
				<div className="relative z-10 max-h-[90vh] overflow-y-auto p-8">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="font-serif text-2xl md:text-3xl">{t.settingsTitle}</h2>
						<button
							type="button"
							onClick={onClose}
							className="rounded-full p-2 transition-colors hover:bg-white/10"
						>
							<X size={20} />
						</button>
					</div>

					<div className="space-y-6">
						<div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4">
							<div className="space-y-2">
								<label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500">
									<Languages size={12} /> {t.langLabel}
								</label>
								<div className="grid grid-cols-2 gap-2">
									{(['en', 'es'] as const).map((lang) => (
										<button
											type="button"
											key={lang}
											onClick={() =>
												onChange({
													...apiConfig,
													language: lang,
												})
											}
											className={`rounded-lg border p-2 text-sm transition-all ${
												apiConfig.language === lang
													? 'border-emerald-500 bg-emerald-900/20 text-emerald-400'
													: 'border-white/10 text-gray-400 hover:bg-white/5'
											}`}
										>
											{lang === 'en' ? 'English' : 'Español'}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500">
									<GraduationCap size={12} /> {t.complexityLabel}
								</label>
								<div className="flex flex-col gap-2">
									<button
										type="button"
										onClick={() =>
											onChange({
												...apiConfig,
												complexity: 'technical',
											})
										}
										className={`rounded-lg border p-3 text-left text-sm transition-all ${
											apiConfig.complexity === 'technical'
												? 'border-blue-500 bg-blue-900/20 text-blue-400'
												: 'border-white/10 text-gray-400 hover:bg-white/5'
										}`}
									>
										{t.compTechnical}
									</button>
									<button
										type="button"
										onClick={() =>
											onChange({
												...apiConfig,
												complexity: 'simple',
											})
										}
										className={`rounded-lg border p-3 text-left text-sm transition-all ${
											apiConfig.complexity === 'simple'
												? 'border-purple-500 bg-purple-900/20 text-purple-400'
												: 'border-white/10 text-gray-400 hover:bg-white/5'
										}`}
									>
										{t.compSimple}
									</button>
								</div>
							</div>
						</div>

						<div className="h-px w-full bg-white/10" />

						<div className="space-y-2">
							<label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
								<Search size={12} /> {t.providerLabel}
							</label>
							<div className="grid grid-cols-3 gap-2">
								{(Object.entries(PROVIDERS) as [ProviderKey, (typeof PROVIDERS)[ProviderKey]][]).map(
									([key, provider]) => {
										const Icon = provider.icon;
										return (
											<button
												type="button"
												key={key}
												onClick={() => onProviderChange(key)}
												className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-gray-400 transition-all ${
													apiConfig.provider === key
														? 'border-emerald-500 bg-emerald-900/10 text-emerald-400'
														: 'border-white/10 hover:border-white/30 hover:bg-white/5'
												}`}
											>
												<Icon size={16} />
												<span className="text-[10px] font-bold">{provider.name}</span>
											</button>
										);
									},
								)}
							</div>
						</div>

						<div className="space-y-2">
							<label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
								<Lock size={12} /> {t.keyLabel} ({PROVIDERS[apiConfig.provider].name})
							</label>
							<input
								type="password"
								value={apiConfig.apiKey}
								onChange={(e) =>
									onChange({
										...apiConfig,
										apiKey: e.target.value,
									})
								}
								placeholder="sk-..."
								className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 transition-all focus:border-emerald-500 focus:bg-white/10 focus:outline-none"
							/>
						</div>

						<div className="space-y-2">
							<label className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
								<Cpu size={12} /> {t.modelLabel}
							</label>
							<select
								value={apiConfig.model}
								onChange={(e) =>
									onChange({
										...apiConfig,
										model: e.target.value,
									})
								}
								className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
							>
								{PROVIDERS[apiConfig.provider].models.map((model) => (
									<option key={model} value={model} className="bg-[#0a0a0a]">
										{model}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="mt-8 flex justify-end border-t border-white/10 pt-6">
						<button
							type="button"
							onClick={onClose}
							disabled={!apiConfig.apiKey}
							className="rounded-lg bg-white px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{t.saveBtn}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsModal;
