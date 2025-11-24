import { Cpu, Globe, Zap } from 'lucide-react';
import type {
	ApiConfig,
	AppView,
	PromptInputs,
	ProviderMap,
	ProviderKey,
	TranslationMap,
} from './types';

export const TRANSLATIONS: TranslationMap = {
	en: {
		appTitle: 'Aether Equity Research',
		settingsBtn: 'Settings & API',
		settingsTitle: 'Intelligence Engine',
		providerLabel: 'Select Provider',
		keyLabel: 'Enter API Key',
		modelLabel: 'Select Reasoning Model',
		langLabel: 'Interface & Analysis Language',
		complexityLabel: 'Analysis Depth',
		saveBtn: 'Save Configuration',
		landingTitle1: 'Institutional',
		landingTitle2: 'Grade',
		landingTitle3: 'Analysis',
		landingSubtitle: 'Powered by LLMs. Real-time Data via Perplexity.',
		tickerLabel: 'Asset / Ticker',
		goalLabel: 'Strategy Goal',
		thesisLabel: 'Investment Thesis (Hypothesis)',
		thesisPlaceholder: 'e.g., I believe the demand is not fully priced in...',
		btnInitiate: 'Initiate Coverage',
		loadingTitle: 'Consulting Live Market Data...',
		loadingSubtitle: 'Provider',
		errorTitle: 'Analysis could not be generated.',
		errorBtn: 'Return to configuration',
		confidence: 'Confidence Score',
		chartTitle: 'Revenue vs EBITDA Growth',
		valMatrix: 'Valuation Matrix',
		sectorTitle: 'Sector & Macro Context',
		execSummary: 'Executive Analysis',
		riskTitle: 'Primary Risk',
		catalystTitle: 'Key Catalyst Watch',
		verdictTitle: 'Final Verdict',
		priceTarget: 'Price Target',
		allocLimit: 'Allocation Limit',
		entryStrat: 'Entry Strategy',
		optValue: 'Value Investing (Long Term)',
		optGrowth: 'Growth / Momentum',
		optBear: 'Short / Bearish Setup',
		optIncome: 'Income / Dividend',
		compTechnical: 'Technical / Institutional (Expert)',
		compSimple: 'Simplified / Educational (Beginner)',
	},
	es: {
		appTitle: 'Aether Equity Research',
		settingsBtn: 'Ajustes y API',
		settingsTitle: 'Motor de Inteligencia',
		providerLabel: 'Seleccionar Proveedor',
		keyLabel: 'Ingresar API Key',
		modelLabel: 'Modelo de Razonamiento',
		langLabel: 'Idioma de Interfaz y Análisis',
		complexityLabel: 'Profundidad del Análisis',
		saveBtn: 'Guardar Configuración',
		landingTitle1: 'Análisis de',
		landingTitle2: 'Grado',
		landingTitle3: 'Institucional',
		landingSubtitle: 'Potenciado por LLMs. Datos en tiempo real vía Perplexity.',
		tickerLabel: 'Activo / Ticker',
		goalLabel: 'Objetivo de Estrategia',
		thesisLabel: 'Tesis de Inversión (Hipótesis)',
		thesisPlaceholder: 'ej. Creo que la demanda del mercado no está descontada en el precio...',
		btnInitiate: 'Iniciar Cobertura',
		loadingTitle: 'Consultando Datos de Mercado...',
		loadingSubtitle: 'Proveedor',
		errorTitle: 'No se pudo generar el análisis.',
		errorBtn: 'Volver a configuración',
		confidence: 'Nivel de Confianza',
		chartTitle: 'Crecimiento Ingresos vs EBITDA',
		valMatrix: 'Matriz de Valoración',
		sectorTitle: 'Contexto Macro y Sectorial',
		execSummary: 'Análisis Ejecutivo',
		riskTitle: 'Riesgo Principal',
		catalystTitle: 'Próximo Catalizador',
		verdictTitle: 'Veredicto Final',
		priceTarget: 'Precio Objetivo',
		allocLimit: 'Límite Asignación',
		entryStrat: 'Estrategia Entrada',
		optValue: 'Value Investing (Largo Plazo)',
		optGrowth: 'Crecimiento / Momentum',
		optBear: 'Short / Bajista',
		optIncome: 'Ingresos / Dividendos',
		compTechnical: 'Técnico / Institucional (Experto)',
		compSimple: 'Simplificado / Educativo (Principiante)',
	},
};

export const PROVIDERS: ProviderMap = {
	openai: {
		name: 'OpenAI',
		url: 'https://api.openai.com/v1/chat/completions',
		models: ['gpt-5.1', 'gpt-5-mini', 'gpt-4o'],
		icon: Zap,
	},
	perplexity: {
		name: 'Perplexity AI',
		url: 'https://api.perplexity.ai/chat/completions',
		models: ['sonar-pro', 'sonar-reasoning-pro'],
		icon: Globe,
	},
	openrouter: {
		name: 'OpenRouter',
		url: 'https://openrouter.ai/api/v1/chat/completions',
		models: [
			'x-ai/grok-4.1-fast:free',
			'perplexity/sonar-deep-research',
			'openai/gpt-4o',
			'google/gemma-3-27b-it',
			'anthropic/claude-sonnet-4.5',
		],
		icon: Cpu,
	},
};

export const DEFAULT_API_CONFIG: ApiConfig = {
	provider: 'openrouter',
	apiKey: '',
	model: 'openai/gpt-4o',
	language: 'en',
	complexity: 'technical',
};

export const DEFAULT_PROMPT_INPUTS: PromptInputs = {
	ticker: '',
	thesis: '',
	goal: 'Long-term compounding',
};

export const DEFAULT_VIEW: AppView = 'landing';

export const GOAL_OPTIONS = [
	{ value: 'Value Investing', key: 'optValue' },
	{ value: 'Growth', key: 'optGrowth' },
	{ value: 'Bearish', key: 'optBear' },
	{ value: 'Income', key: 'optIncome' },
] as const;

export const DASHBOARD_ANIMATION_DELAY = 600;

export const PROVIDER_KEYS = Object.keys(PROVIDERS) as ProviderKey[];
