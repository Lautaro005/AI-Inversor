import type { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'es';
export type Complexity = 'technical' | 'simple';
export type AppView = 'landing' | 'dashboard';
export type ProviderKey = 'openai' | 'perplexity' | 'openrouter';

export interface ProviderConfig {
	name: string;
	url: string;
	models: string[];
	icon: LucideIcon;
}

export interface ApiConfig {
	provider: ProviderKey;
	apiKey: string;
	model: string;
	language: Language;
	complexity: Complexity;
}

export interface PromptInputs {
	ticker: string;
	thesis: string;
	goal: string;
}

export interface FundEntry {
	year: string;
	revenue: number;
	ebitda: number;
}

export interface ValuationItem {
	metric: string;
	value: number;
	peerAvg: number;
}

export interface FinalRecommendation {
	action: string;
	priceTarget: string;
	allocationLimit: string;
	entryStrategy: string;
	justification: string;
}

export interface AnalysisResponse {
	fundamentals: FundEntry[];
	valuation: ValuationItem[];
	verdict: string;
	confidence: string;
	summary: string[];
	primaryRisk: string;
	nextCatalyst: string;
	sectorContext: string;
	finalRecommendation?: FinalRecommendation;
}

export interface Translation {
	appTitle: string;
	settingsBtn: string;
	settingsTitle: string;
	providerLabel: string;
	keyLabel: string;
	modelLabel: string;
	langLabel: string;
	complexityLabel: string;
	saveBtn: string;
	landingTitle1: string;
	landingTitle2: string;
	landingTitle3: string;
	landingSubtitle: string;
	tickerLabel: string;
	goalLabel: string;
	thesisLabel: string;
	thesisPlaceholder: string;
	btnInitiate: string;
	loadingTitle: string;
	loadingSubtitle: string;
	errorTitle: string;
	errorBtn: string;
	confidence: string;
	chartTitle: string;
	valMatrix: string;
	sectorTitle: string;
	execSummary: string;
	riskTitle: string;
	catalystTitle: string;
	verdictTitle: string;
	priceTarget: string;
	allocLimit: string;
	entryStrat: string;
	optValue: string;
	optGrowth: string;
	optBear: string;
	optIncome: string;
	compTechnical: string;
	compSimple: string;
}

export type TranslationMap = Record<Language, Translation>;
export type ProviderMap = Record<ProviderKey, ProviderConfig>;
