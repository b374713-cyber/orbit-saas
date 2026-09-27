'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, FolderKanban, Building2 } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const urlOrgId = searchParams.get('organizationId') || '';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  // ✅ Compute currentOrg FIRST (before using it in useProjects)
  const currentOrg = urlOrgId
    ? organizations?.find((o) => o.id === urlOrgId)
    : organizations?.[0];

  // ✅ Pass currentOrg?.id — this becomes stable once orgs load
  const { data: projects, isLoading: projectsLoading } = useProjects(
    currentOrg?.id || '',
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">
            {currentOrg
              ? `Projects in ${currentOrg.name}`
              : orgsLoading
                ? 'Loading...'
                : 'Select an organization to view projects.'}
          </p>
        </div>
        {currentOrg && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Loading */}
      {(orgsLoading || projectsLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* No Organization */}
      {!orgsLoading && (!organizations || organizations.length === 0) && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No organizations yet
          </h2>
          <p className="text-slate-600 mb-6">
            Create an organization first to start managing projects.
          </p>
          <Link
            href="/organizations"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition"
          >
            <Building2 className="w-5 h-5" />
            Go to Organizations
          </Link>
        </div>
      )}

      {/* Empty Projects */}
      {!orgsLoading &&
        !projectsLoading &&
        currentOrg &&
        (!projects || projects.length === 0) && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              No projects yet
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Create your first project in {currentOrg.name} to start managing
              tasks and collaborating with your team.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        )}

      {/* Projects Grid */}
      {!projectsLoading && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Modal */}
      {currentOrg && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          organizationId={currentOrg.id}
        />
      )}
    </div>
  );
}