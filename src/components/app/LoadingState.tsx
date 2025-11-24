import type { ApiConfig, Translation } from './types';
import { PROVIDERS } from './constants';

interface LoadingStateProps {
	t: Translation;
	apiConfig: ApiConfig;
}

const LoadingState = ({ t, apiConfig }: LoadingStateProps) => (
	<div className="flex h-[70vh] flex-col items-center justify-center space-y-8">
		<div className="relative h-24 w-24">
			<div className="absolute inset-0 animate-spin rounded-full border-t-2 border-emerald-500" />
			<div className="absolute inset-2 animate-spin rounded-full border-r-2 border-white/20 [animation-direction:reverse] [animation-duration:1000ms]" />
		</div>
		<div className="space-y-2 text-center">
			<h3 className="animate-pulse font-serif text-2xl">{t.loadingTitle}</h3>
			<p className="font-mono text-xs uppercase tracking-widest text-emerald-500/70">
				{t.loadingSubtitle}: {PROVIDERS[apiConfig.provider].name} //{' '}
				{apiConfig.complexity === 'simple' ? 'Simple Mode' : 'Technical Mode'}
			</p>
		</div>
	</div>
);

export default LoadingState;
