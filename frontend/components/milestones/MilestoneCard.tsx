'use client';

import { Calendar, CheckCircle2, Clock, Circle } from 'lucide-react';
import { Milestone } from '@/hooks/useMilestones';
import { formatDate } from '@/lib/utils';

interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: () => void;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'text-slate-700 bg-slate-100 border-slate-200',
    icon: Circle,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-green-700 bg-green-50 border-green-200',
    icon: CheckCircle2,
  },
};

export function MilestoneCard({ milestone, onClick }: MilestoneCardProps) {
  const config = statusConfig[milestone.status];
  const StatusIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900 line-clamp-2">
          {milestone.title}
        </h3>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${config.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Description */}
      {milestone.description && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {milestone.description}
        </p>
      )}

      {/* Progress */}
      {milestone.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>
              {milestone.doneTasksCount || 0}/{milestone.tasksCount || 0} tasks
            </span>
            <span className="font-medium text-slate-700">
              {milestone.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                milestone.status === 'COMPLETED'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${milestone.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      {milestone.dueDate && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Due {formatDate(milestone.dueDate)}</span>
        </div>
      )}
    </div>
  );
}