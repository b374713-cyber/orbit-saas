'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProjects } from '@/hooks/useProjects';
import {
  FolderKanban,
  CheckCircle2,
  Users,
  Building2,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  // Get the first organization (for projects count)
  const firstOrgId = organizations?.[0]?.id || '';
  const { data: projects, isLoading: projectsLoading } = useProjects(firstOrgId);

  // Calculate total stats
  const totalOrganizations = organizations?.length || 0;
  const totalProjects = projects?.length || 0;
  const totalTasks =
    projects?.reduce((sum, p) => sum + (p._count?.tasks || 0), 0) || 0;
  const totalMembers =
    organizations?.reduce((sum, o) => sum + (o._count?.members || 0), 0) || 0;

  const isLoading = orgsLoading || projectsLoading;

  const stats = [
    {
      label: 'Organizations',
      value: totalOrganizations,
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
      href: '/organizations',
    },
    {
      label: 'Projects',
      value: totalProjects,
      icon: FolderKanban,
      color: 'bg-purple-100 text-purple-600',
      href: '/projects',
    },
    {
      label: 'Tasks',
      value: totalTasks,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
      href: '/projects',
    },
    {
      label: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      href: '/organizations',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-600 mt-1">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {isLoading ? '...' : stat.value}
                </span>
              </div>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Empty State OR Recent */}
      {totalOrganizations === 0 && !isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Get started with ORBIT
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Create your first organization to start managing projects and
            collaborating with your team.
          </p>
          <Link
            href="/organizations"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Organization
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Projects
              </h2>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            </div>
            {projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project._count?.tasks || 0} tasks ·{' '}
                        {project._count?.members || 0} members
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {project.progress || 0}%
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                No projects yet
              </p>
            )}
          </div>

          {/* Your Organizations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Your Organizations
              </h2>
              <Link
                href="/organizations"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            </div>
            {organizations && organizations.length > 0 ? (
              <div className="space-y-3">
                {organizations.slice(0, 5).map((org) => (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-slate-500">@{org.slug}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {org._count?.members || 0} members
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                No organizations yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}