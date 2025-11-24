import type { ApiConfig } from './types';

interface FooterStatusProps {
	apiConfig: ApiConfig;
}

const FooterStatus = ({ apiConfig }: FooterStatusProps) => (
	<footer className="pointer-events-none fixed bottom-6 right-6 z-40 mix-blend-difference">
		<div className="text-right font-mono text-[10px] text-white/50">
			<p>EQUITY INTELLIGENCE SYS</p>
			<p>
				ACTIVE PROVIDER: {apiConfig.provider.toUpperCase()} // LANG:{' '}
				{apiConfig.language.toUpperCase()}
			</p>
		</div>
	</footer>
);

export default FooterStatus;
