'use client';

import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
}

export function StatsCards({
  totalTasks,
  doneTasks,
  inProgressTasks,
  overdueTasks,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Completed',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-slate-900">
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-slate-600">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}