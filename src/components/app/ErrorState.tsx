import type { Translation } from './types';

interface ErrorStateProps {
	t: Translation;
	error: string;
	onReset: () => void;
}

const ErrorState = ({ t, error, onReset }: ErrorStateProps) => (
	<div className="flex h-[50vh] flex-col items-center justify-center text-center">
		<p className="mb-4 text-red-400">{error || t.errorTitle}</p>
		<button type="button" onClick={onReset} className="text-emerald-400 underline">
			{t.errorBtn}
		</button>
	</div>
);

export default ErrorState;
