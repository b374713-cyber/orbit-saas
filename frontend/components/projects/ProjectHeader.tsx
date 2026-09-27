'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  LayoutGrid,
  MessageSquare,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Project } from '@/types';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname();
  const baseUrl = `/projects/${project.id}`;

  const tabs = [
    {
      href: baseUrl,
      label: 'Overview',
      icon: LayoutGrid,
    },
    {
      href: `${baseUrl}/roadmap`,
      label: 'Roadmap',
      icon: Calendar,
    },
    {
      href: `${baseUrl}/analytics`,
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      href: `${baseUrl}/kanban`,
      label: 'Kanban',
      icon: LayoutGrid,
    },
    {
      href: `${baseUrl}/chat`,
      label: 'Chat',
      icon: MessageSquare,
    },
  ];

  return (
    <div>
      <Link
        href={`/organizations/${project.organizationId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organization
      </Link>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-slate-600 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
            {project.health && (
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  project.health === 'HEALTHY'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : project.health === 'AT_RISK'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {project.health === 'HEALTHY'
                  ? '🟢 Healthy'
                  : project.health === 'AT_RISK'
                    ? '🟡 At Risk'
                    : '🔴 Critical'}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-slate-200 px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}