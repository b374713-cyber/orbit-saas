'use client';

import { Users } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface TeamWorkloadProps {
  data: Array<{
    userId: string;
    name: string;
    avatarUrl: string | null;
    activeTasks: number;
    completedTasks: number;
  }>;
}

export function TeamWorkload({ data }: TeamWorkloadProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Team Workload
        </h3>
        <p className="text-center py-12 text-slate-500">
          No assignments yet
        </p>
      </div>
    );
  }

  const maxTasks = Math.max(
    ...data.map((d) => d.activeTasks + d.completedTasks),
    1,
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        Team Workload
      </h3>
      <div className="space-y-4">
        {data.map((member) => {
          const total = member.activeTasks + member.completedTasks;
          const activePercent = (member.activeTasks / maxTasks) * 100;
          const donePercent = (member.completedTasks / maxTasks) * 100;

          return (
            <div key={member.userId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(member.name)}
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {member.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {member.activeTasks} active · {member.completedTasks} done
                </span>
              </div>
              <div className="flex h-2 bg-slate-100 rounded-full overflow-hidden">
                {member.activeTasks > 0 && (
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500"
                    style={{ width: `${activePercent}%` }}
                  />
                )}
                {member.completedTasks > 0 && (
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500"
                    style={{ width: `${donePercent}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}