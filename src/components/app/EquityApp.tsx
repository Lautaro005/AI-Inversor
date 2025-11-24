import { useEffect, useState } from 'react';
import BackgroundDecor from './BackgroundDecor';
import DashboardView from './DashboardView';
import ErrorState from './ErrorState';
import FooterStatus from './FooterStatus';
import HeaderBar from './HeaderBar';
import LandingView from './LandingView';
import LoadingState from './LoadingState';
import SettingsModal from './SettingsModal';
import {
	DEFAULT_API_CONFIG,
	DEFAULT_PROMPT_INPUTS,
	DEFAULT_VIEW,
	PROVIDERS,
	TRANSLATIONS,
} from './constants';
import { buildSystemPrompt, cleanModelResponse } from './helpers';
import type { AnalysisResponse, ApiConfig, AppView, PromptInputs, ProviderKey } from './types';

const EquityApp = () => {
	const [view, setView] = useState<AppView>(DEFAULT_VIEW);
	const [showSettings, setShowSettings] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [error, setError] = useState('');
	const [resultData, setResultData] = useState<AnalysisResponse | null>(null);
	const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_API_CONFIG);
	const [promptInputs, setPromptInputs] = useState<PromptInputs>(DEFAULT_PROMPT_INPUTS);

	const t = TRANSLATIONS[apiConfig.language];

	const handleProviderChange = (provider: ProviderKey) => {
		setApiConfig({
			...apiConfig,
			provider,
			model: PROVIDERS[provider].models[0],
			apiKey: '',
		});
	};

	const handlePromptChange = (field: keyof PromptInputs, value: string) => {
		setPromptInputs((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleAnalyze = async () => {
		if (!promptInputs.ticker) return;
		if (!apiConfig.apiKey) {
			setError('API Key missing. Please configure settings.');
			setShowSettings(true);
			setView('landing');
			return;
		}

		setIsAnalyzing(true);
		setError('');
		setResultData(null);

		try {
			const providerSettings = PROVIDERS[apiConfig.provider];
			const systemPrompt = buildSystemPrompt(apiConfig);

			const payload = {
				model: apiConfig.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{
						role: 'user',
						content: `Analyze Ticker: ${promptInputs.ticker}. \nUser Thesis: ${promptInputs.thesis}. \nInvestment Goal: ${promptInputs.goal}.`,
					},
				],
				temperature: 0.2,
				max_tokens: 2500,
				stream: false,
			};

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiConfig.apiKey}`,
			};

			if (apiConfig.provider === 'openrouter' && typeof window !== 'undefined') {
				headers['HTTP-Referer'] = window.location.href;
				headers['X-Title'] = 'Equity Intelligence Platform';
			}

			const response = await fetch(providerSettings.url, {
				method: 'POST',
				headers,
				body: JSON.stringify(payload),
				mode: 'cors',
				credentials: 'omit',
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.error?.message || `API Error: ${response.status}`);
			}

			const data = await response.json();
			const rawContent: string = data?.choices?.[0]?.message?.content || '';
			const parsedData = cleanModelResponse(rawContent);

			setResultData(parsedData);
			setView('dashboard');
		} catch (err) {
			console.error('Analysis Failed:', err);
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to fetch analysis.';

			if (errorMessage.includes('Failed to fetch')) {
				setError('Network Error (CORS). Direct browser access to this API might be blocked. Try using OpenRouter.');
			} else {
				setError(errorMessage || 'Failed to fetch analysis.');
			}
			setView('landing');
		} finally {
			setIsAnalyzing(false);
		}
	};

	useEffect(() => {
		if (typeof document === 'undefined') return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = showSettings ? 'hidden' : '';
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [showSettings]);

	const handleReset = () => {
		setView('landing');
		setResultData(null);
		setError('');
		setIsAnalyzing(false);
	};

	return (
		<div className="selection:bg-emerald-500/30 selection:text-emerald-200 min-h-dvh bg-[#0a0a0a] font-sans text-white overflow-x-hidden">
			<BackgroundDecor />
			<HeaderBar
				appTitle={t.appTitle}
				hasApiKey={Boolean(apiConfig.apiKey)}
				failoverLabel={t.settingsBtn}
				onOpenSettings={() => setShowSettings(true)}
				onLogoClick={() => setView('landing')}
			/>
			<SettingsModal
				open={showSettings}
				apiConfig={apiConfig}
				onChange={setApiConfig}
				onProviderChange={handleProviderChange}
				onClose={() => setShowSettings(false)}
				t={t}
			/>

			{view === 'landing' && (
				<LandingView
					t={t}
					inputs={promptInputs}
					error={error}
					onPromptChange={handlePromptChange}
					onSubmit={() => {
						setView('dashboard');
						handleAnalyze();
					}}
				/>
			)}

			{view === 'dashboard' && (
				<main className="min-h-screen px-4 pb-12 pt-24 md:px-8">
					{isAnalyzing && <LoadingState t={t} apiConfig={apiConfig} />}
					{!isAnalyzing && resultData && (
						<DashboardView t={t} resultData={resultData} promptInputs={promptInputs} />
					)}
					{!isAnalyzing && !resultData && <ErrorState t={t} error={error} onReset={handleReset} />}
				</main>
			)}

			<FooterStatus apiConfig={apiConfig} />

			<style>
				{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
			</style>
		</div>
	);
};

export default EquityApp;
