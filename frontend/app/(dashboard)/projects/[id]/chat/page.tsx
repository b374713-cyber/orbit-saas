'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading } = useProject(projectId);

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

  return (
    <div className="p-8">
      <ProjectHeader project={project} />
      <div className="mt-6">
        <ChatWindow projectId={projectId} projectName={project.name} />
      </div>
    </div>
  );
}