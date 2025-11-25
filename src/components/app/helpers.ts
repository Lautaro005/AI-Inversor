import type { AnalysisResponse, ApiConfig } from './types';

export const buildSystemPrompt = (apiConfig: ApiConfig) => {
	const currentYear = new Date().getFullYear();
	const fundamentalsYears: string[] = [];
	for (let year = currentYear - 4; year <= currentYear; year += 1) {
		fundamentalsYears.push(`${year}`);
	}
	fundamentalsYears.push(`${currentYear + 1} (Est)`);

	const fundamentalsSchema = fundamentalsYears
		.map((label) => `    {"year": "${label}", "revenue": number, "ebitda": number}`)
		.join(',\n');

	const langInstruction =
		apiConfig.language === 'es'
			? 'You MUST respond in SPANISH. Translate all qualitative analysis to Spanish.'
			: 'You MUST respond in ENGLISH.';

	const roleDefinition =
		apiConfig.complexity === 'technical'
			? 'ROLE: Elite Equity Research Analyst & Macro Strategist. Use professional financial jargon, focus on metrics, derivatives, and sophisticated market mechanics.'
			: "ROLE: Financial Educator & Investment Guide. Use clear, simple language suitable for a beginner investor. Avoid heavy jargon or explain it simply. Focus on the 'story' of the company and actionable advice.";

	return `
${roleDefinition}
TASK: Analyze the requested company ticker. You MUST access real-time data (if capable) or use your internal knowledge base.
${langInstruction}

Ensure quantitative data stays current through ${currentYear} with ${currentYear + 1} shown as an estimate.

OUTPUT FORMAT: You must respond with ONLY valid JSON. Do not include markdown formatting like \`\`\`json. 
IMPORTANT: The JSON object KEYS (e.g., "fundamentals", "revenue", "verdict") MUST remain in ENGLISH exactly as shown below for the code to work. The VALUES (strings) should be in ${
		apiConfig.language === 'es' ? 'Spanish' : 'English'
	}.

JSON Schema:
{
  "fundamentals": [
${fundamentalsSchema}
  ],
  "valuation": [
    {"metric": "P/E Ratio", "value": number, "peerAvg": number},
    {"metric": "EV/EBITDA", "value": number, "peerAvg": number},
    {"metric": "P/S Ratio", "value": number, "peerAvg": number}
  ],
  "verdict": "BULLISH" | "BEARISH" | "NEUTRAL",
  "confidence": "High" | "Medium" | "Low",
  "summary": [
    "Detailed bullet point 1",
    "Detailed bullet point 2",
    "Detailed bullet point 3",
    "Detailed bullet point 4",
    "Detailed bullet point 5"
  ],
  "primaryRisk": "Short description of the biggest downside risk",
  "nextCatalyst": "Short description of the upcoming event",
  "sectorContext": "A brief, dense paragraph analyzing the sector trends.",
  "finalRecommendation": {
    "action": "STRONG BUY | BUY | HOLD | SELL | STRONG SELL",
    "priceTarget": "Specific price range or value",
    "allocationLimit": "Percentage of portfolio",
    "entryStrategy": "How to buy/sell",
    "justification": "One powerful sentence justifying this specific action."
  }
}

Ensure the numbers are realistic. ${
		apiConfig.complexity === 'simple'
			? 'Keep explanations educational and easy to digest.'
			: 'Ensure deep technical accuracy.'
	}
`;
};

export const cleanModelResponse = (payload: string) => {
	let sanitized = payload
		.replace(/<think>[\s\S]*?<\/think>/g, '')
		.replace(/```json/g, '')
		.replace(/```/g, '')
		.trim();

	const firstBrace = sanitized.indexOf('{');
	const lastBrace = sanitized.lastIndexOf('}');

	if (firstBrace !== -1 && lastBrace !== -1) {
		sanitized = sanitized.substring(firstBrace, lastBrace + 1);
	}

	return JSON.parse(sanitized) as AnalysisResponse;
};

export const getActionColor = (action?: string) => {
	if (!action) return 'border-gray-500 text-gray-500';
	const act = action.toUpperCase();
	if (act.includes('BUY') || act.includes('COMPRA') || act.includes('COMPRAR')) {
		return 'border-emerald-500 text-emerald-400 bg-emerald-900/10';
	}
	if (act.includes('SELL') || act.includes('VENTA') || act.includes('VENDER')) {
		return 'border-red-500 text-red-400 bg-red-900/10';
	}
	return 'border-amber-500 text-amber-400 bg-amber-900/10';
};
