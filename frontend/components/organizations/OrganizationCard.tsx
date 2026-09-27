'use client';

import Link from 'next/link';
import { Building2, Users, FolderKanban } from 'lucide-react';
import { Organization } from '@/types';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <Link
      href={`/organizations/${organization.id}`}
      className="block bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {organization.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
            {organization.name}
          </h3>
          <p className="text-sm text-slate-500 truncate">
            @{organization.slug}
          </p>
        </div>
      </div>

      {/* Description */}
      {organization.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {organization.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4" />
          <span>{organization._count?.members || 0} members</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FolderKanban className="w-4 h-4" />
          <span>{organization._count?.projects || 0} projects</span>
        </div>
      </div>
    </Link>
  );
}