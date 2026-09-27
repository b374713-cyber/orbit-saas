'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Wand2,
  Rocket,
} from 'lucide-react';
import {
  useGenerateProjectPlan,
  useCreateProjectFromAi,
  AiProjectPlan,
} from '@/hooks/useAi';
import { AiLoadingAnimation } from './AiLoadingAnimation';
import { AiPlanPreview } from './AiPlanPreview';

interface AiProjectWizardProps {
  organizationId: string;
}

type Step = 'input' | 'loading' | 'preview' | 'creating';

export function AiProjectWizard({ organizationId }: AiProjectWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('4 weeks');
  const [teamSize, setTeamSize] = useState(3);
  const [plan, setPlan] = useState<AiProjectPlan | null>(null);
  const [error, setError] = useState('');

  const generatePlan = useGenerateProjectPlan();
  const createProject = useCreateProjectFromAi();

  const handleGenerate = async () => {
    if (description.length < 10) {
      setError('Please describe your project in at least 10 characters');
      return;
    }

    setError('');
    setStep('loading');

    try {
      const result = await generatePlan.mutateAsync({
        description,
        duration,
        teamSize,
      });
      setPlan(result);
      setStep('preview');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to generate plan. Try again.',
      );
      setStep('input');
    }
  };

  const handleCreate = async () => {
    if (!plan) return;

    setError('');
    setStep('creating');

    try {
      const project = await createProject.mutateAsync({
        organizationId,
        projectName: plan.projectName,
        description: plan.description,
        milestones: plan.milestones,
      });

      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create project. Try again.',
      );
      setStep('preview');
    }
  };

  const handleReset = () => {
    setPlan(null);
    setDescription('');
    setError('');
    setStep('input');
  };

  // Step: Input
  if (step === 'input') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              AI Project Planner
            </h1>
            <p className="text-slate-600">
              Describe your project and let AI create a complete plan with
              milestones and tasks
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{ color: '#0f172a' }}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              placeholder="Example: Build a modern e-commerce platform with user authentication, product catalog, shopping cart, payment integration, and admin dashboard"
            />
            <p className="text-xs text-slate-500 mt-1">
              Be specific about features and requirements for better results
            </p>
          </div>

          {/* Duration + Team */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ color: '#0f172a' }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              >
                <option value="2 weeks">2 weeks</option>
                <option value="4 weeks">4 weeks</option>
                <option value="6 weeks">6 weeks</option>
                <option value="8 weeks">8 weeks</option>
                <option value="12 weeks">12 weeks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Team Size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                style={{ color: '#0f172a' }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={5}>5 people</option>
                <option value={10}>10 people</option>
              </select>
            </div>
          </div>

          {/* Examples */}
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase mb-2">
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'E-commerce website with payments',
                'Mobile app with chat and notifications',
                'SaaS dashboard with analytics',
                'Marketing website with blog',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setDescription(example)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 transition"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleGenerate}
            disabled={description.length < 10}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-md"
          >
            <Wand2 className="w-5 h-5" />
            Generate Plan with AI
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step: Loading
  if (step === 'loading') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <AiLoadingAnimation />
        </div>
      </div>
    );
  }

  // Step: Preview
  if (step === 'preview' && plan) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Review Your AI Plan
              </h1>
              <p className="text-sm text-slate-600">
                Review the generated plan. You can edit after creating.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Regenerate
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Plan Preview */}
          <AiPlanPreview plan={plan} />

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Regenerate
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
            >
              <Rocket className="w-5 h-5" />
              Create Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step: Creating
  if (step === 'creating') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Creating your project...
            </h3>
            <p className="text-slate-600 text-sm">
              Setting up milestones and tasks
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}