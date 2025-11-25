import jsPDF from 'jspdf';
import type { AnalysisResponse, Language, PromptInputs, Translation } from './types';

interface PdfPayload {
	resultData: AnalysisResponse;
	promptInputs: PromptInputs;
	t: Translation;
	language: Language;
}

const formatCompact = (value: number, language: Language) => {
	if (typeof value !== 'number' || Number.isNaN(value)) return '—';
	return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
		notation: 'compact',
		maximumFractionDigits: 1,
	}).format(value);
};

export const generateReportPdf = ({ resultData, promptInputs, t, language }: PdfPayload) => {
	const doc = new jsPDF({ unit: 'pt', format: 'a4' });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();

	const palette = {
		bgNight: [3, 7, 18],
		bgMid: [6, 10, 20],
		paper: [10, 15, 26],
		card: [14, 21, 36],
		sidebar: [13, 19, 32],
		accent: [16, 185, 129],
		accentBlue: [59, 130, 246],
		text: '#f8fafc',
		textMuted: '#94a3b8',
	};

	const layout = {
		margin: 60,
		top: 150,
		bottom: 80,
		sidebarWidth: 0,
		gutter: 0,
	};

	const contentWidth = pageWidth - layout.margin * 2;
	layout.sidebarWidth = Math.min(Math.round(pageWidth * 0.33), Math.round(contentWidth * 0.38));
	layout.sidebarWidth = Math.max(layout.sidebarWidth, Math.round(contentWidth * 0.3));
	layout.gutter = Math.max(36, contentWidth * 0.045);

	const mainX = layout.margin + layout.sidebarWidth + layout.gutter;
	const mainWidth = pageWidth - mainX - layout.margin;

	const analysisSubtitle = promptInputs.thesis?.trim() || t.analysisSubtitleFallback;
	const goalText = promptInputs.goal || t.analysisSubtitleFallback;
	const fundamentals = resultData.fundamentals || [];
	const latestFund = fundamentals[fundamentals.length - 1];
	const earliestFund = fundamentals[0];

	let sidebarY = layout.top;
	let mainY = layout.top;

	const setFont = (family: 'helvetica' | 'times', style: 'normal' | 'bold' | 'italic') => {
		doc.setFont(family, style);
	};

	const getWrappedLines = (text: string, width: number) => (text ? doc.splitTextToSize(text, width) : []);
	const drawLines = (lines: string[], x: number, y: number, lineHeight = 14) => {
		lines.forEach((line, index) => {
			doc.text(line, x, y + index * lineHeight);
		});
		return lines.length * lineHeight;
	};

	const drawWrappedText = (text: string, x: number, y: number, width: number, lineHeight = 14) => {
		if (!text) return 0;
		const lines = getWrappedLines(text, width);
		return drawLines(lines, x, y, lineHeight);
	};

	const wrapText = (text: string, width: number, options?: { avoidBreakingWords?: boolean }) => {
		if (!text) return [];
		if (!options?.avoidBreakingWords) {
			return doc.splitTextToSize(text, width);
		}
		const words = text.split(/\s+/);
		const lines: string[] = [];
		let current = '';
		words.forEach((word) => {
			const candidate = current ? `${current} ${word}` : word;
			if (doc.getTextWidth(candidate) <= width) {
				current = candidate;
			} else {
				if (current) lines.push(current);
				if (doc.getTextWidth(word) > width) {
					lines.push(...doc.splitTextToSize(word, width));
					current = '';
				} else {
					current = word;
				}
			}
		});
		if (current) lines.push(current);
		return lines;
	};

	const fitText = (text: string, width: number, preferredSize: number, minSize = 10) => {
		let size = preferredSize;
		doc.setFontSize(size);
		while (doc.getTextWidth(text) > width && size > minSize) {
			size -= 1;
			doc.setFontSize(size);
		}
		return size;
	};

	const applyCover = () => {
		doc.setFillColor(...palette.bgNight);
		doc.rect(0, 0, pageWidth, pageHeight, 'F');

		doc.setFillColor(8, 24, 47);
		doc.rect(-20, pageHeight * 0.35, pageWidth + 40, pageHeight, 'F');

		doc.setFillColor(...palette.accentBlue);
		doc.circle(pageWidth - 140, 140, 90, 'F');

		doc.setFillColor(...palette.accent);
		doc.circle(pageWidth - 240, 220, 40, 'F');

		setFont('helvetica', 'bold');
		doc.setFontSize(14);
		doc.setTextColor(palette.textMuted);
		doc.text('AETHER EQUITY RESEARCH', layout.margin, layout.margin);

		setFont('times', 'bold');
		doc.setFontSize(96);
		doc.setTextColor(palette.text);
		doc.text(promptInputs.ticker || 'TICKER', layout.margin, pageHeight / 2 - 20);

		const coverTitle = language === 'es' ? 'INTELIGENCIA DE RENTA VARIABLE' : 'EQUITY INTELLIGENCE BRIEF';
		setFont('helvetica', 'bold');
		const titleWidth = pageWidth * 0.55;
		const titleSize = fitText(coverTitle, titleWidth, 28, 18);
		doc.setFontSize(titleSize);
		const coverTitleLines = doc.splitTextToSize(coverTitle, titleWidth);
		drawLines(coverTitleLines, layout.margin, pageHeight / 2 + 20, titleSize + 4);

		setFont('helvetica', 'normal');
		doc.setFontSize(14);
		doc.setTextColor(palette.textMuted);
		const thesisHeight = drawWrappedText(analysisSubtitle, layout.margin, pageHeight / 2 + 60, pageWidth * 0.6, 18);

		const coverBadgeWidth = 260;
		const coverBadgeHeight = 180;
		const badgeX = layout.margin;
		const initialBadgeY = pageHeight / 2 + 60 + thesisHeight + 24;
		const badgeY = Math.min(initialBadgeY, pageHeight - coverBadgeHeight - layout.margin);
		doc.setFillColor(12, 20, 36);
		doc.roundedRect(badgeX, badgeY, coverBadgeWidth, coverBadgeHeight, 18, 18, 'F');

		setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.setTextColor(palette.textMuted);
		doc.text('STRATEGY GOAL', badgeX + 24, badgeY + 28);
		setFont('helvetica', 'normal');
		doc.setFontSize(16);
		doc.setTextColor(palette.text);
		drawWrappedText(goalText, badgeX + 24, badgeY + 52, coverBadgeWidth - 48, 16);

		doc.setDrawColor(...palette.accent);
		doc.setLineWidth(2);
		doc.line(badgeX + 24, badgeY + 80, badgeX + coverBadgeWidth - 24, badgeY + 80);

		const preparedLabel = language === 'es' ? 'Emitido' : 'Issued';
		const dateLabel = new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		setFont('helvetica', 'bold');
		doc.setFontSize(10);
		doc.setTextColor(palette.textMuted);
		doc.text(preparedLabel.toUpperCase(), badgeX + 24, badgeY + 108);
		setFont('helvetica', 'normal');
		doc.setFontSize(14);
		doc.setTextColor(palette.text);
		doc.text(dateLabel, badgeX + 24, badgeY + 128);

		const verdictText = resultData.verdict ? resultData.verdict.toUpperCase() : t.verdictTitle;
		setFont('helvetica', 'bold');
		doc.setFontSize(20);
		doc.setTextColor(palette.text);
		doc.text(verdictText, badgeX + 24, badgeY + 162);
	};

	const drawChrome = (title: string, subtitle: string, variant: 'night' | 'mid') => {
		const bg = variant === 'night' ? palette.bgNight : palette.bgMid;
		doc.setFillColor(...bg);
		doc.rect(0, 0, pageWidth, pageHeight, 'F');

		const headerY = layout.margin - 26;
		doc.setFillColor(...palette.paper);
		doc.roundedRect(layout.margin, headerY, pageWidth - layout.margin * 2, 76, 18, 18, 'F');

		setFont('helvetica', 'bold');
		doc.setFontSize(14);
		doc.setTextColor(palette.textMuted);
		doc.text(title.toUpperCase(), layout.margin + 26, headerY + 26);
		setFont('helvetica', 'normal');
		doc.setFontSize(12);
		doc.setTextColor(palette.text);
		doc.text(subtitle, layout.margin + 26, headerY + 46);

		doc.setFontSize(8);
		doc.setTextColor(palette.textMuted);
		doc.text(t.appTitle.toUpperCase(), layout.margin + 26, headerY - 10);

		doc.setFontSize(9);
		doc.setTextColor(palette.textMuted);
		doc.text('AETHER RESEARCH', layout.margin - 28, pageHeight - layout.bottom, {
			angle: 90,
		});

		setFont('helvetica', 'bold');
		doc.setFontSize(46);
		doc.setTextColor(30, 41, 59);
		doc.text(doc.getNumberOfPages().toString().padStart(2, '0'), pageWidth - layout.margin, pageHeight - layout.bottom + 10, {
			align: 'right',
		});

		const columnHeight = pageHeight - layout.top - layout.bottom + 60;
		doc.setFillColor(6, 12, 24);
		doc.roundedRect(layout.margin - 24, layout.top - 40, pageWidth - (layout.margin - 24) * 2, columnHeight + 40, 28, 28, 'F');
		doc.setFillColor(12, 20, 34);
		doc.roundedRect(layout.margin - 2, layout.top - 20, layout.sidebarWidth + 4, columnHeight, 18, 18, 'F');
		doc.roundedRect(mainX - layout.gutter / 2, layout.top - 20, mainWidth + layout.gutter / 2 + 2, columnHeight, 18, 18, 'F');
		doc.setTextColor(palette.text);
	};

	const initContentPage = (title: string, subtitle: string, variant: 'night' | 'mid') => {
		doc.addPage();
		drawChrome(title, subtitle, variant);
		sidebarY = layout.top;
		mainY = layout.top;
	};

	const addSidebarCard = (title: string, content: string, accent = false) => {
		setFont('helvetica', 'normal');
		doc.setFontSize(12);
		const contentLines = wrapText(content, layout.sidebarWidth - 32, { avoidBreakingWords: true });
		const cardHeight = Math.max(56, 32 + contentLines.length * 14);
		doc.setFillColor(...(accent ? palette.card : palette.sidebar));
		doc.roundedRect(layout.margin, sidebarY, layout.sidebarWidth, cardHeight, 12, 12, 'F');

		setFont('helvetica', 'bold');
		doc.setFontSize(9);
		doc.setTextColor(palette.textMuted);
		doc.text(title.toUpperCase(), layout.margin + 16, sidebarY + 18);
		setFont('helvetica', 'normal');
		doc.setFontSize(12);
		doc.setTextColor(palette.text);
		contentLines.forEach((line, index) => {
			doc.text(line, layout.margin + 16, sidebarY + 38 + index * 14);
		});

		sidebarY += cardHeight + 16;
	};

	const addHighlightRow = () => {
		const cardConfigs = [
			{ label: t.revenueLabel, value: latestFund ? `USD ${formatCompact(latestFund.revenue, language)}` : '—' },
			{ label: t.ebitdaLabel, value: latestFund ? `USD ${formatCompact(latestFund.ebitda, language)}` : '—' },
			{
				label: language === 'es' ? 'Crecimiento vs 2020' : 'Growth vs 2020',
				value:
					latestFund && earliestFund
						? `${Math.round(((latestFund.revenue - earliestFund.revenue) / earliestFund.revenue) * 100)}%`
						: '—',
			},
		];

		const topCards = cardConfigs.slice(0, 2);
		const growthCard = cardConfigs[2];
		const columnGap = 18;
		const topCardWidth = (mainWidth - columnGap) / 2;

		const drawMetricCard = (card: { label: string; value: string }, x: number, y: number, width: number) => {
			setFont('helvetica', 'bold');
			doc.setFontSize(20);
			const valueLines = wrapText(card.value, width - 40, { avoidBreakingWords: true });
			const cardHeight = Math.max(90, 58 + valueLines.length * 20);
			doc.setFillColor(...palette.card);
			doc.roundedRect(x, y, width, cardHeight, 14, 14, 'F');
			setFont('helvetica', 'bold');
			doc.setFontSize(10);
			doc.setTextColor(palette.textMuted);
			doc.text(card.label.toUpperCase(), x + 20, y + 24);
			setFont('helvetica', 'bold');
			doc.setFontSize(20);
			doc.setTextColor(palette.text);
			drawLines(valueLines, x + 20, y + 48, 20);
			return cardHeight;
		};

		const topHeights = topCards.map((card, idx) => {
			const x = mainX + idx * (topCardWidth + columnGap);
			return drawMetricCard(card, x, mainY, topCardWidth);
		});

		const topRowHeight = Math.max(...topHeights);
		mainY += topRowHeight + 18;

		const growthHeight = drawMetricCard(growthCard, mainX, mainY, mainWidth);
		mainY += growthHeight + 28;
	};

	const addQuoteBlock = () => {
		const quoteLines = doc.splitTextToSize(analysisSubtitle, mainWidth - 80);
		const blockHeight = Math.max(120, quoteLines.length * 14 + 70);
		doc.setFillColor(12, 18, 32);
		doc.roundedRect(mainX, mainY, mainWidth, blockHeight, 18, 18, 'F');

		setFont('times', 'italic');
		doc.setFontSize(22);
		doc.setTextColor(...palette.accent);
		doc.text('"', mainX + 20, mainY + 50);
		doc.text('"', mainX + mainWidth - 30, mainY + blockHeight - 20);

		setFont('helvetica', 'normal');
		doc.setFontSize(13);
		doc.setTextColor(palette.text);
		quoteLines.forEach((line, index) => {
			doc.text(line, mainX + 50, mainY + 34 + index * 16);
		});

		setFont('helvetica', 'bold');
		doc.setFontSize(10);
		doc.setTextColor(palette.textMuted);
		doc.text(t.thesisLabel.toUpperCase(), mainX + 50, mainY + blockHeight - 18);

		mainY += blockHeight + 30;
	};

	const addSummaryList = () => {
		if (!resultData.summary?.length) return;
		doc.setFillColor(11, 17, 30);
		const blockPadding = 28;
		const bulletSpacing = 12;
		const startX = layout.margin - 24;
		const startY = Math.max(sidebarY, layout.top);
		const execWidth = pageWidth - (layout.margin - 24) * 2;
		const bulletIndent = 16;
		const textWidth = execWidth - blockPadding * 2 - bulletIndent;
		const summaryLines = resultData.summary.map((point) => wrapText(point, textWidth, { avoidBreakingWords: true }));
		const contentHeight =
			summaryLines.reduce((total, lines) => total + lines.length * 15, 0) +
			bulletSpacing * Math.max(0, summaryLines.length - 1);
		const blockHeight = blockPadding * 2 + contentHeight + 12;
		doc.roundedRect(startX, startY, execWidth, blockHeight, 18, 18, 'F');

		setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.setTextColor(palette.textMuted);
		doc.text(t.execSummary.toUpperCase(), startX + blockPadding, startY + blockPadding - 4);

		setFont('helvetica', 'normal');
		doc.setFontSize(11);
		doc.setTextColor(palette.text);

		let y = startY + blockPadding + 16;
		const bulletX = startX + blockPadding;
		summaryLines.forEach((lines, idx) => {
			doc.text('•', bulletX, y);
			lines.forEach((line, lineIdx) => {
				doc.text(line, bulletX + bulletIndent, y + lineIdx * 15);
			});
			y += lines.length * 15;
			if (idx !== summaryLines.length - 1) y += bulletSpacing;
		});

		sidebarY = startY + blockHeight + 24;
		mainY = sidebarY;
	};

	const drawMiniChart = () => {
		if (!fundamentals.length) return;

		const chartHeight = 170;
		const chartWidth = mainWidth;
		const chartX = mainX;
		const chartY = mainY;

		doc.setFillColor(10, 16, 30);
		doc.roundedRect(chartX, chartY, chartWidth, chartHeight, 16, 16, 'F');

		const years = fundamentals.map((entry) => entry.year);
		const values = fundamentals.flatMap((entry) => [entry.revenue, entry.ebitda]);
		const maxValue = Math.max(...values);
		const paddingX = 36;
		const paddingY = 32;
		const innerWidth = chartWidth - paddingX * 2;
		const innerHeight = chartHeight - paddingY * 2;

		setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.setTextColor(palette.textMuted);
		doc.text(t.chartTitle.toUpperCase(), chartX + paddingX, chartY + paddingY - 14);

		doc.setDrawColor(31, 41, 55);
		doc.setLineWidth(0.7);
		for (let i = 0; i <= 3; i += 1) {
			const y = chartY + paddingY + (innerHeight / 3) * i;
			doc.line(chartX + paddingX, y, chartX + paddingX + innerWidth, y);
		}

		const drawSeries = (key: 'revenue' | 'ebitda', color: [number, number, number]) => {
			doc.setDrawColor(...color);
			doc.setLineWidth(2);
			for (let i = 1; i < fundamentals.length; i += 1) {
				const prev = fundamentals[i - 1];
				const curr = fundamentals[i];
				const prevX = chartX + paddingX + ((i - 1) / (fundamentals.length - 1)) * innerWidth;
				const currX = chartX + paddingX + (i / (fundamentals.length - 1)) * innerWidth;
				const prevY =
					chartY + paddingY + innerHeight - (Math.max(prev[key], 0) / maxValue) * innerHeight * 0.9;
				const currY =
					chartY + paddingY + innerHeight - (Math.max(curr[key], 0) / maxValue) * innerHeight * 0.9;
				doc.line(prevX, prevY, currX, currY);
			}
		};

		drawSeries('revenue', palette.accent);
		drawSeries('ebitda', palette.accentBlue);

		setFont('helvetica', 'bold');
		doc.setFontSize(9);
		doc.setTextColor(palette.textMuted);
		years.forEach((year, index) => {
			const x = chartX + paddingX + (index / (years.length - 1)) * innerWidth;
			doc.text(year, x, chartY + chartHeight - 12, { align: 'center' });
		});

		mainY += chartHeight + 30;
	};

	const addSectorBlock = () => {
		if (!resultData.sectorContext) return;
		const bodyLines = doc.splitTextToSize(resultData.sectorContext, mainWidth - 48);
		const bodyHeight = bodyLines.length * 15;
		const blockHeight = Math.max(140, 70 + bodyHeight);
		doc.setFillColor(13, 21, 38);
		doc.roundedRect(mainX, mainY, mainWidth, blockHeight, 18, 18, 'F');
		setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.setTextColor(palette.textMuted);
		doc.text(t.sectorTitle.toUpperCase(), mainX + 24, mainY + 30);
		setFont('helvetica', 'normal');
		doc.setFontSize(11);
		doc.setTextColor(palette.text);
		drawLines(bodyLines, mainX + 24, mainY + 54, 15);
		mainY += blockHeight + 30;
	};

	const addValuationGrid = () => {
		if (!resultData.valuation?.length) return;
		const gridPadding = 24;
		const columns = 2;
		const cardWidth = (mainWidth - gridPadding) / columns;
		const peerLabel = language === 'es' ? 'Promedio sector' : 'Peer avg';
		const peerLineHeight = 12;
		const peerLines = resultData.valuation.map((item) =>
			doc.splitTextToSize(`${peerLabel}: ${item.peerAvg}x`, cardWidth - 40),
		);
		const maxPeerLines = peerLines.reduce((max, lines) => Math.max(max, lines.length || 1), 1);
		const cardHeight = Math.max(120, 100 + maxPeerLines * peerLineHeight);

		resultData.valuation.forEach((item, idx) => {
			const column = idx % columns;
			const row = Math.floor(idx / columns);
			const x = mainX + column * (cardWidth + gridPadding);
			const y = mainY + row * (cardHeight + 20);
			doc.setFillColor(12, 18, 32);
			doc.roundedRect(x, y, cardWidth, cardHeight, 16, 16, 'F');
			setFont('helvetica', 'bold');
			doc.setFontSize(10);
			doc.setTextColor(palette.textMuted);
			doc.text(item.metric.toUpperCase(), x + 20, y + 22);
			setFont('helvetica', 'bold');
			doc.setFontSize(28);
			doc.setTextColor(palette.text);
			doc.text(`${item.value}x`, x + 20, y + 60);
			setFont('helvetica', 'normal');
			doc.setFontSize(11);
			doc.setTextColor(palette.textMuted);
			const lines = peerLines[idx];
			drawLines(lines, x + 20, y + 88, peerLineHeight);
		});

		const rows = Math.ceil(resultData.valuation.length / columns);
		const rowGap = 18;
		mainY += rows * (cardHeight + rowGap);
	};

	const addFinalBlock = () => {
		const rec = resultData.finalRecommendation;
		if (!rec) return;
		mainY = Math.max(mainY, sidebarY) + 30;
		sidebarY = mainY;
		const blockX = layout.margin;
		const blockWidth = pageWidth - layout.margin * 2;
		const metrics = [
			{ label: t.priceTarget, value: rec.priceTarget },
			{ label: t.allocLimit, value: rec.allocationLimit },
			{ label: t.entryStrat, value: rec.entryStrategy },
		];
		setFont('helvetica', 'normal');
		doc.setFontSize(12);
		const metricWidth = (blockWidth - 48) / metrics.length;
		const metricLines = metrics.map((metric) =>
			wrapText(metric.value, metricWidth - 18, { avoidBreakingWords: true }),
		);
		const metricHeights = metricLines.map((lines) => Math.max(26, lines.length * 15));
		const metricSectionHeight = Math.max(...metricHeights) + 16;
		const justificationLines = wrapText(rec.justification, blockWidth - 48);
		const justificationHeight = justificationLines.length * 14;
		const metricsLabelOffset = 130;
		const metricsStartOffset = metricsLabelOffset + 20;
		const justificationOffset = metricsStartOffset + metricSectionHeight + 18;
		const blockHeight = Math.max(230, justificationOffset + justificationHeight + 24);
		const columnBottom = pageHeight - layout.bottom;
		const blockTop = Math.min(mainY, columnBottom - blockHeight);
		const metricsLabelY = blockTop + metricsLabelOffset;
		const metricsStartY = blockTop + metricsStartOffset;
		const justificationStartY = blockTop + justificationOffset;
		doc.setFillColor(12, 26, 27);
		doc.roundedRect(blockX, blockTop, blockWidth, blockHeight, 20, 20, 'F');
		setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.setTextColor(palette.textMuted);
		doc.text(t.verdictTitle.toUpperCase(), blockX + 24, blockTop + 28);
		setFont('helvetica', 'bold');
		const actionSize = fitText(rec.action, blockWidth - 48, 40, 28);
		doc.setFontSize(actionSize);
		doc.setTextColor(...palette.accent);
		doc.text(rec.action, blockX + 24, blockTop + 78);

		doc.setDrawColor(...palette.accent);
		doc.setLineWidth(1);
		doc.line(blockX + 24, blockTop + 96, blockX + blockWidth - 24, blockTop + 96);

		metrics.forEach((metric, idx) => {
			const x = blockX + 24 + idx * metricWidth;
			setFont('helvetica', 'bold');
			doc.setFontSize(10);
			doc.setTextColor(palette.textMuted);
			doc.text(metric.label.toUpperCase(), x, metricsLabelY);
			setFont('helvetica', 'normal');
			doc.setFontSize(12);
			doc.setTextColor(palette.text);
			drawLines(metricLines[idx], x, metricsStartY, 15);
		});

		setFont('helvetica', 'italic');
		doc.setFontSize(11);
		doc.setTextColor(palette.text);
		drawLines(justificationLines, blockX + 24, justificationStartY, 14);

		mainY = blockTop + blockHeight + 18;
	};

	const addPlaybookNote = () => {
		doc.setFillColor(12, 18, 32);
		const label = language === 'es' ? 'Matriz de valoración' : 'Playbook context';
		const description =
			language === 'es'
				? 'Comparamos el múltiplo de cada métrica con el promedio sectorial para entender hacia dónde está orientada la prima o el descuento.'
				: 'Each multiple is plotted versus the sector cohort to spot premiums, discounts and regime shifts for positioning.';
		const descriptionLines = doc.splitTextToSize(description, mainWidth - 40);
		const blockHeight = Math.max(110, 56 + descriptionLines.length * 14);
		doc.roundedRect(mainX, mainY, mainWidth, blockHeight, 16, 16, 'F');
		setFont('helvetica', 'bold');
		doc.setFontSize(12);
		doc.setTextColor(palette.textMuted);
		doc.text(label.toUpperCase(), mainX + 20, mainY + 24);
		setFont('helvetica', 'normal');
		doc.setFontSize(11);
		doc.setTextColor(palette.text);
		drawLines(descriptionLines, mainX + 20, mainY + 46, 15);
		mainY += blockHeight + 20;
	};

	applyCover();
	initContentPage(
		language === 'es' ? 'Informe táctico' : 'Intelligence Brief',
		language === 'es' ? 'Narrativa de mercado y contexto macro' : 'Market narrative & macro context',
		'night',
	);

	addSidebarCard(t.verdictTitle, `${resultData.verdict || '—'} / ${t.confidence}: ${resultData.confidence}`, true);
	addSidebarCard(t.goalLabel, goalText);
	addSidebarCard(t.riskTitle, resultData.primaryRisk || '—');
	addSidebarCard(t.catalystTitle, resultData.nextCatalyst || '—');

	addQuoteBlock();
	addHighlightRow();
		while (sidebarY < mainY - 12) {
			sidebarY += 12;
		}
		addSummaryList();
	drawMiniChart();
	addSectorBlock();

	initContentPage(
		language === 'es' ? 'Matriz estratégica' : 'Valuation Playbook',
		language === 'es' ? 'Múltiplos, comparables y ejecución' : 'Multiples, comps & execution',
		'mid',
	);

	addSidebarCard('EBITDA', latestFund ? `USD ${formatCompact(latestFund.ebitda, language)}` : '—', true);
	if (resultData.finalRecommendation) {
		addSidebarCard(t.priceTarget, resultData.finalRecommendation.priceTarget);
		addSidebarCard(t.allocLimit, resultData.finalRecommendation.allocationLimit);
	}
	addSidebarCard(t.entryStrat, resultData.finalRecommendation?.entryStrategy || goalText);

	addPlaybookNote();
	addValuationGrid();
	addFinalBlock();

	const fileName = `${promptInputs.ticker || 'analysis'}-report.pdf`;
	doc.save(fileName);
};

export default generateReportPdf;
