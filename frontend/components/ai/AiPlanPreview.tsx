'use client';

import {
  Target,
  ListTodo,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { AiProjectPlan } from '@/hooks/useAi';
import { getPriorityColor } from '@/lib/utils';

interface AiPlanPreviewProps {
  plan: AiProjectPlan;
}

export function AiPlanPreview({ plan }: AiPlanPreviewProps) {
  const totalTasks = plan.milestones.reduce(
    (sum, m) => sum + m.tasks.length,
    0,
  );
  const totalDays = plan.milestones.reduce(
    (sum, m) => sum + (m.durationDays || 7),
    0,
  );
  const totalHours = plan.milestones.reduce(
    (sum, m) =>
      sum + m.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {plan.projectName}
            </h2>
            <p className="text-sm text-slate-600">{plan.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Milestones</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {plan.milestones.length}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
              <ListTodo className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Duration</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {totalDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase">
          Milestones & Tasks
        </h3>

        {plan.milestones.map((milestone, mIndex) => (
          <div
            key={mIndex}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {/* Milestone Header */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {mIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900">
                  {milestone.title}
                </h4>
                {milestone.description && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {milestone.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {milestone.durationDays || 7} days
                  </span>
                  <span className="flex items-center gap-1">
                    <ListTodo className="w-3 h-3" />
                    {milestone.tasks.length} tasks
                  </span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="divide-y divide-slate-100">
              {milestone.tasks.map((task, tIndex) => (
                <div key={tIndex} className="p-4 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        {task.estimatedHours && (
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            ~{task.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          This is AI-generated content. You can edit milestones and tasks after
          creating the project.
        </p>
      </div>
    </div>
  );
}