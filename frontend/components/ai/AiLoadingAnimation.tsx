'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Brain, Wand2, Rocket } from 'lucide-react';

const STEPS = [
  { icon: Brain, text: 'Analyzing your project description...' },
  { icon: Sparkles, text: 'Designing milestones and phases...' },
  { icon: Wand2, text: 'Generating detailed tasks...' },
  { icon: Rocket, text: 'Finalizing your project plan...' },
];

export function AiLoadingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 blur-2xl opacity-30 animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
          <CurrentIcon className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>

      {/* Animated Rings */}
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
        AI is thinking...
      </h3>

      {/* Current Step */}
      <p className="text-slate-600 text-sm animate-pulse">
        {STEPS[currentStep].text}
      </p>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === currentStep
                ? 'w-8 bg-blue-600'
                : i < currentStep
                  ? 'w-2 bg-blue-400'
                  : 'w-2 bg-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-400 mt-6">
        This usually takes 5-15 seconds
      </p>
    </div>
  );
}