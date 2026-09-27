'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Plus,
  Target,
} from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { useMilestones } from '@/hooks/useMilestones';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { MilestoneCard } from '@/components/milestones/MilestoneCard';
import { CreateMilestoneModal } from '@/components/milestones/CreateMilestoneModal';
import { AiSummaryPanel } from '@/components/ai/AiSummaryPanel';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  const { data: project, isLoading } = useProject(projectId);
  const { data: milestones, isLoading: milestonesLoading } =
    useMilestones(projectId);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Project not found.
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Tasks',
      value: project._count?.tasks || 0,
      icon: ListTodo,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Members',
      value: project._count?.members || 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Progress',
      value: `${project.progress || 0}%`,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Done',
      value: project.tasksSummary?.DONE || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="p-8">
      <ProjectHeader project={project} />

      {/* ← جديد: AI Summary Panel */}
      <div className="mt-6">
        <AiSummaryPanel projectId={projectId} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Roadmap / Milestones ({milestones?.length || 0})
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Track the phases and goals of this project
            </p>
          </div>
          <button
            onClick={() => setIsMilestoneModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Milestone
          </button>
        </div>
        <div className="p-6">
          {milestonesLoading ? (
            <div className="text-center py-8 text-slate-500">
              Loading milestones...
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onClick={() => {
                    // TODO: Open milestone detail modal
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-slate-600 mb-3">No milestones yet</p>
              <p className="text-sm text-slate-500 mb-4">
                Break your project into phases with milestones
              </p>
              <button
                onClick={() => setIsMilestoneModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first milestone →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Overall Progress
          </h2>
          <span className="text-2xl font-bold text-slate-900">
            {project.progress || 0}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Task Breakdown */}
      {project.tasksSummary && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Task Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries({
              BACKLOG: 'Backlog',
              TODO: 'To Do',
              IN_PROGRESS: 'In Progress',
              REVIEW: 'Review',
              DONE: 'Done',
            }).map(([key, label]) => (
              <div key={key} className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {project.tasksSummary?.[key] || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}