'use client';

import { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAnalyzeProjectRisk } from '@/hooks/useAi';

interface AiRiskPanelProps {
  projectId: string;
}

const RISK_CONFIG = {
  LOW: {
    label: 'Low Risk',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: ShieldCheck,
  },
  MEDIUM: {
    label: 'Medium Risk',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: TrendingUp,
  },
  HIGH: {
    label: 'High Risk',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
  },
};

const SEVERITY_CONFIG = {
  LOW: { color: 'text-green-600', bg: 'bg-green-100' },
  MEDIUM: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
  HIGH: { color: 'text-orange-600', bg: 'bg-orange-100' },
  CRITICAL: { color: 'text-red-600', bg: 'bg-red-100' },
};

export function AiRiskPanel({ projectId }: AiRiskPanelProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const analyzeRisk = useAnalyzeProjectRisk();

  const handleAnalyze = async () => {
    try {
      const result = await analyzeRisk.mutateAsync(projectId);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze risk:', error);
    }
  };

  // Initial state - show button
  if (!analysis && !analyzeRisk.isPending) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          AI Risk Analysis
        </h3>
        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
          Let AI analyze your project's health, identify risks, and provide
          actionable recommendations.
        </p>
        <button
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          Analyze with AI
        </button>
      </div>
    );
  }

  // Loading state
  if (analyzeRisk.isPending) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          AI is analyzing your project...
        </h3>
        <p className="text-sm text-slate-600">
          Looking at progress, deadlines, dependencies, and workload
        </p>
      </div>
    );
  }

  // Error state
  if (analyzeRisk.isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <p className="text-sm text-red-700 mb-4">
          Failed to analyze project. Please try again.
        </p>
        <button
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Analysis state
  const config = RISK_CONFIG[analysis.riskLevel as keyof typeof RISK_CONFIG];
  const RiskIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                AI Analysis
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color} ${config.border} flex items-center gap-1`}
              >
                <RiskIcon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
            <p className="text-sm text-slate-600">{analysis.summary}</p>
          </div>
          <button
            onClick={handleAnalyze}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
            title="Re-analyze"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Health Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">
              Health Score
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {analysis.healthScore}/100
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                analysis.healthScore >= 70
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : analysis.healthScore >= 40
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
              style={{ width: `${analysis.healthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            Detected Risks ({analysis.risks.length})
          </h3>
          <div className="space-y-3">
            {analysis.risks.map((risk: any, i: number) => {
              const sevConfig =
                SEVERITY_CONFIG[risk.severity as keyof typeof SEVERITY_CONFIG];
              return (
                <div
                  key={i}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${sevConfig.bg} ${sevConfig.color} flex-shrink-0`}
                    >
                      {risk.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 mb-1">
                        {risk.title}
                      </h4>
                      <p className="text-xs text-slate-600 mb-2">
                        {risk.description}
                      </p>
                      <div className="flex items-start gap-1.5 p-2 bg-blue-50 rounded border border-blue-100">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-900">
                          {risk.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 uppercase mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}