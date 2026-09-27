'use client';

import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import { CreateOrganizationModal } from '@/components/organizations/CreateOrganizationModal';

export default function OrganizationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: organizations, isLoading, error } = useOrganizations();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
          <p className="text-slate-600 mt-1">
            Manage your organizations and teams.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
        >
          <Plus className="w-5 h-5" />
          New Organization
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse"
            >
              <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load organizations. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && organizations && organizations.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No organizations yet
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Create your first organization to start managing projects and
            collaborating with your team.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Organization
          </button>
        </div>
      )}

      {/* Organizations Grid */}
      {!isLoading && organizations && organizations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}