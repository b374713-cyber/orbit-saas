'use client';

import Link from 'next/link';
import { Calendar, Users, CheckCircle2 } from 'lucide-react';
import { Project, HealthStatus } from '@/types';
import { getHealthColor, formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

function HealthBadge({ health }: { health?: HealthStatus }) {
  if (!health) return null;

  const config = {
    HEALTHY: { label: '🟢 Healthy', color: 'text-green-700 bg-green-50 border-green-200' },
    AT_RISK: { label: '🟡 At Risk', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    CRITICAL: { label: '🔴 Critical', color: 'text-red-700 bg-red-50 border-red-200' },
  };

  const { label, color } = config[health];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
          {project.name}
        </h3>
        <HealthBadge health={project.health} />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      {project.progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-slate-700">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {project._count?.members || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {project._count?.tasks || 0} tasks
          </span>
        </div>
        {project.endDate && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(project.endDate)}
          </span>
        )}
      </div>
    </Link>
  );
}