'use client';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  Settings,
  UserPlus,
  ArrowLeft,
  Crown,
  Plus,
} from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganizations';
import { useProjects } from '@/hooks/useProjects';
import { MemberList } from '@/components/organizations/MemberList';
import { InviteMemberModal } from '@/components/organizations/InviteMemberModal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export default function OrganizationDetailPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const { data: organization, isLoading, error } = useOrganization(organizationId);
  const { data: projects, isLoading: projectsLoading } = useProjects(organizationId);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Organization not found or you don&apos;t have access.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back */}
      <Link
        href="/organizations"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organizations
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {organization.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              {organization.name}
            </h1>
            <p className="text-slate-500 mb-3">@{organization.slug}</p>
            {organization.description && (
              <p className="text-slate-700">{organization.description}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <span>{organization._count?.members || 0} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FolderKanban className="w-4 h-4" />
                <span>{organization._count?.projects || 0} projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Crown className="w-4 h-4 text-purple-500" />
                <span>{organization.owner?.name || 'Unknown'} (Owner)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Projects ({projects?.length || 0})
              </h2>
              <div className="flex items-center gap-2">
  <Link
    href={`/projects/ai-create?organizationId=${organizationId}`}
    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-sm"
  >
    <Sparkles className="w-4 h-4" />
    AI Planner
  </Link>
  <button
    onClick={() => setIsProjectModalOpen(true)}
    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition font-medium"
  >
    <Plus className="w-4 h-4" />
    New Project
  </button>
</div>
            </div>
            <div className="p-6">
              {projectsLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Loading projects...
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-3">No projects yet</p>
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create the first one →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Members ({organization._count?.members || 0})
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
            </div>
            <div className="p-6">
              <MemberList members={organization.members || []} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/projects?organizationId=${organization.id}`}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition text-slate-700"
              >
                <FolderKanban className="w-5 h-5 text-slate-500" />
                <span className="text-sm">View All Projects</span>
              </Link>
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition text-slate-700">
                <Settings className="w-5 h-5 text-slate-500" />
                <span className="text-sm">Organization Settings</span>
              </button>
            </div>
          </div>

          {/* Organization Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Created</p>
                <p className="text-slate-900">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Slug</p>
                <p className="text-slate-900 font-mono text-xs">
                  @{organization.slug}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={organizationId}
      />
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
}