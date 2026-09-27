'use client';

import { useState } from 'react';
import {
  Sparkles,
  FileText,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { useGenerateProjectSummary } from '@/hooks/useAi';

interface AiSummaryPanelProps {
  projectId: string;
}

export function AiSummaryPanel({ projectId }: AiSummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSummary = useGenerateProjectSummary();

  const handleGenerate = async () => {
    try {
      const result = await generateSummary.mutateAsync(projectId);
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Initial state - show button
  if (!summary && !generateSummary.isPending) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              AI Project Summary
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Get an instant executive summary of your project status,
              achievements, and next steps.
            </p>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Generate Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (generateSummary.isPending) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          AI is writing your summary...
        </h3>
        <p className="text-sm text-slate-600">
          Analyzing project status, milestones, and recent activity
        </p>
      </div>
    );
  }

  // Error state
  if (generateSummary.isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">
              Failed to generate summary
            </h4>
            <p className="text-sm text-red-700 mb-3">
              Something went wrong. Please try again.
            </p>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary state
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">AI Project Summary</h3>
            <p className="text-xs text-slate-600">
              Generated just now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/50 transition"
            title="Copy summary"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-600" />
            )}
          </button>
          <button
            onClick={handleGenerate}
            className="p-2 rounded-lg hover:bg-white/50 transition"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Summary Content */}
      <div className="p-6">
        <div className="prose prose-slate max-w-none">
          {summary?.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              className="text-sm text-slate-700 leading-relaxed mb-4 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}