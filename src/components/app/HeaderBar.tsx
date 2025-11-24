import { Settings } from 'lucide-react';

interface HeaderBarProps {
	appTitle: string;
	hasApiKey: boolean;
	onLogoClick: () => void;
	onOpenSettings: () => void;
	failoverLabel: string;
}

const HeaderBar = ({ appTitle, hasApiKey, onLogoClick, onOpenSettings, failoverLabel }: HeaderBarProps) => (
	<header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-6 text-white mix-blend-difference">
		<button
			type="button"
			onClick={onLogoClick}
			className="group flex items-center gap-2"
			aria-label="Return to landing"
		>
			<div className="h-3 w-3 rounded-full bg-white transition-transform duration-500 group-hover:scale-150" />
			<span className="font-serif text-xl font-light tracking-tighter">{appTitle}</span>
		</button>
		<button
			type="button"
			onClick={onOpenSettings}
			className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm uppercase tracking-widest transition-all duration-300 ${
				!hasApiKey
					? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse'
					: 'border-white/20 text-white hover:bg-white hover:text-black'
			}`}
		>
			<Settings size={14} />
			<span>{hasApiKey ? failoverLabel : 'API Key'}</span>
		</button>
	</header>
);

export default HeaderBar;
