const BackgroundDecor = () => (
	<div className="pointer-events-none fixed inset-0">
		<div className="absolute top-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-emerald-900/10 opacity-50 blur-[120px]" />
		<div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-900/10 opacity-30 blur-[100px]" />
		<div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
	</div>
);

export default BackgroundDecor;
