'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { StatsCards } from '@/components/analytics/StatsCards';
import { ProgressChart } from '@/components/analytics/ProgressChart';
import { TaskDistribution } from '@/components/analytics/TaskDistribution';
import { TeamWorkload } from '@/components/analytics/TeamWorkload';
import { VelocityChart } from '@/components/analytics/VelocityChart';
import { PriorityBreakdown } from '@/components/analytics/PriorityBreakdown';
import { AiRiskPanel } from '@/components/ai/AiRiskPanel';

export default function AnalyticsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(projectId);

  const analytics = useAnalytics(project, tasksData?.tasks || []);

  if (projectLoading || tasksLoading) {
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

  return (
    <div className="p-8">
      <ProjectHeader project={project} />

      <div className="mt-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Project Analytics
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Overview of team performance and project progress
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalTasks={analytics.totalTasks}
          doneTasks={analytics.doneTasks}
          inProgressTasks={analytics.inProgressTasks}
          overdueTasks={analytics.overdueTasks}
        />

        {/* Progress Over Time */}
        <ProgressChart data={analytics.progressOverTime} />

        {/* Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskDistribution data={analytics.tasksByStatus} />
          <PriorityBreakdown data={analytics.tasksByPriority} />
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamWorkload data={analytics.teamWorkload} />
          <VelocityChart data={analytics.velocity} />
        </div>

        {/* ← أضف هذا: AI Risk Analysis */}
        <AiRiskPanel projectId={projectId} />
      </div>
    </div>
  );
}