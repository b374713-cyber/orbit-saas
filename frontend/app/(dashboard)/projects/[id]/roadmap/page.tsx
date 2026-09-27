'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useMilestones } from '@/hooks/useMilestones';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Timeline } from '@/components/roadmap/Timeline';

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(projectId);
  const { data: milestones, isLoading: milestonesLoading } =
    useMilestones(projectId);

  if (projectLoading || tasksLoading || milestonesLoading) {
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

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Project Roadmap
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Timeline view of milestones and tasks
          </p>
        </div>

        <Timeline
          milestones={milestones || []}
          tasks={tasksData?.tasks || []}
        />
      </div>
    </div>
  );
}