'use client';

import { useState } from 'react';
import { Link2, Lock, Plus, X, AlertTriangle } from 'lucide-react';
import {
  useDependencies,
  useAddDependency,
  useRemoveDependency,
} from '@/hooks/useDependencies';
import { getStatusColor, getInitials } from '@/lib/utils';
import { Task } from '@/types';

interface DependenciesSectionProps {
  taskId: string;
  projectId: string;
  allTasks: Task[];
}

export function DependenciesSection({
  taskId,
  allTasks,
}: DependenciesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const { data, isLoading } = useDependencies(taskId);
  const addDependency = useAddDependency();
  const removeDependency = useRemoveDependency();

  // Available tasks (exclude self + already dependencies)
  const currentDependencyIds = data?.dependencies.map((d) => d.id) || [];
  const availableTasks = allTasks.filter(
    (t) => t.id !== taskId && !currentDependencyIds.includes(t.id),
  );

  const handleAdd = async () => {
    if (!selectedTaskId) return;
    try {
      await addDependency.mutateAsync({
        taskId,
        dependsOnTaskId: selectedTaskId,
      });
      setSelectedTaskId('');
      setIsAdding(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add dependency');
    }
  };

  const handleRemove = async (dependsOnTaskId: string) => {
    if (!confirm('Remove this dependency?')) return;
    try {
      await removeDependency.mutateAsync({ taskId, dependsOnTaskId });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove dependency');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-12 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Blocked Warning */}
      {data?.isBlocked && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Task is blocked</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Waiting on {data.dependencies.filter((d) => d.status !== 'DONE').length} incomplete {data.dependencies.filter((d) => d.status !== 'DONE').length === 1 ? 'dependency' : 'dependencies'}
            </p>
          </div>
        </div>
      )}

      {/* Dependencies (Blocked by) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            Blocked by ({data?.dependencies.length || 0})
          </h4>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              style={{ color: '#0f172a' }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm mb-2"
            >
              <option value="">Select a task...</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-600 hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!selectedTaskId || addDependency.isPending}
                className="flex-1 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {addDependency.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* Dependencies List */}
        {data?.dependencies && data.dependencies.length > 0 ? (
          <div className="space-y-2">
            {data.dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 group"
              >
                {dep.status === 'DONE' ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 truncate">{dep.title}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(dep.status)}`}
                  >
                    {dep.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(dep.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-500 transition"
                  title="Remove dependency"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2 text-center">
            No dependencies
          </p>
        )}
      </div>

      {/* Dependents (Blocking) */}
      {data?.dependents && data.dependents.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3" />
            Blocking ({data.dependents.length})
          </h4>
          <div className="space-y-2">
            {data.dependents.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 truncate">{dep.title}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(dep.status)}`}
                  >
                    {dep.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}