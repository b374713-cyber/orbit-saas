'use client';

import { Calendar, Target } from 'lucide-react';
import { Milestone } from '@/hooks/useMilestones';
import { Task } from '@/types';
import { TimelineHeader } from './TimelineHeader';
import { TimelineBar } from './TimelineBar';
import { formatDate } from '@/lib/utils';

interface TimelineProps {
  milestones: Milestone[];
  tasks: Task[];
  onMilestoneClick?: (milestone: Milestone) => void;
  onTaskClick?: (task: Task) => void;
}

export function Timeline({
  milestones,
  tasks,
  onMilestoneClick,
  onTaskClick,
}: TimelineProps) {
  // Calculate timeline range
  const allDates: Date[] = [];

  milestones.forEach((m) => {
    if (m.dueDate) allDates.push(new Date(m.dueDate));
    if (m.createdAt) allDates.push(new Date(m.createdAt));
  });

  tasks.forEach((t) => {
    if (t.dueDate) allDates.push(new Date(t.dueDate));
    if (t.createdAt) allDates.push(new Date(t.createdAt));
  });

  if (allDates.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No milestones or tasks with dates to display
      </div>
    );
  }

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Extend range by 7 days on each side
  const timelineStart = new Date(minDate);
  timelineStart.setDate(timelineStart.getDate() - 7);

  const timelineEnd = new Date(maxDate);
  timelineEnd.setDate(timelineEnd.getDate() + 7);

  // Group tasks by milestone
  const tasksByMilestone = new Map<string | null, Task[]>();
  tasks.forEach((task) => {
    const key = task.milestoneId || null;
    if (!tasksByMilestone.has(key)) {
      tasksByMilestone.set(key, []);
    }
    tasksByMilestone.get(key)!.push(task);
  });

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'IN_PROGRESS':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      default:
        return 'bg-gradient-to-r from-cyan-400 to-sky-500'; // ← أزرق فاتح لـ PENDING
    }
  };

  const getTaskColor = (priority: string, status: string) => {
    if (status === 'DONE') {
      return 'bg-gradient-to-r from-green-400 to-emerald-500';
    }

    switch (priority) {
      case 'URGENT':
        return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500 to-amber-600';
      case 'MEDIUM':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      default:
        return 'bg-gradient-to-r from-slate-400 to-slate-500';
    }
  };

  // Calculate safe dates for a task (default 7 days)
  const getTaskDates = (task: Task) => {
    const start = new Date(task.createdAt);
    const end = task.dueDate
      ? new Date(task.dueDate)
      : new Date(start.getTime() + 7 * 86400000); // ← 7 أيام افتراضي

    // Ensure minimum 7 days span
    const daysDiff = (end.getTime() - start.getTime()) / 86400000;
    if (daysDiff < 7) {
      return {
        start,
        end: new Date(start.getTime() + 7 * 86400000),
      };
    }

    return { start, end };
  };

  // Calculate safe dates for a milestone (default 14 days)
  const getMilestoneDates = (milestone: Milestone) => {
    const start = new Date(milestone.createdAt);
    const end = milestone.dueDate
      ? new Date(milestone.dueDate)
      : new Date(start.getTime() + 14 * 86400000);

    // Ensure minimum 7 days span
    const daysDiff = (end.getTime() - start.getTime()) / 86400000;
    if (daysDiff < 7) {
      return {
        start,
        end: new Date(start.getTime() + 14 * 86400000),
      };
    }

    return { start, end };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <TimelineHeader startDate={timelineStart} endDate={timelineEnd} />

      {/* Body */}
      <div className="divide-y divide-slate-100">
        {/* Milestones and their tasks */}
        {milestones.map((milestone) => {
          const milestoneTasks = tasksByMilestone.get(milestone.id) || [];
          const hasDates = milestone.dueDate || milestone.createdAt;

          if (!hasDates) return null;

          const { start, end } = getMilestoneDates(milestone);

          return (
            <div key={milestone.id} className="p-4">
              {/* Milestone Bar */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {milestone.dueDate && formatDate(milestone.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <TimelineBar
                    startDate={start}
                    endDate={end}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    color={getMilestoneColor(milestone.status)}
                    label={milestone.title}
                    progress={milestone.progress || 0}
                    size="large"
                    onClick={() => onMilestoneClick?.(milestone)}
                  />
                </div>
              </div>

              {/* Tasks */}
              {milestoneTasks.length > 0 && (
                <div className="space-y-2 ml-8">
                  {milestoneTasks.map((task) => {
                    const { start: taskStart, end: taskEnd } =
                      getTaskDates(task);

                    return (
                      <div key={task.id} className="flex items-center gap-3">
                        <div className="w-48 flex-shrink-0 pl-4">
                          <p className="text-xs text-slate-600 truncate">
                            {task.title}
                          </p>
                        </div>
                        <div className="flex-1">
                          <TimelineBar
                            startDate={taskStart}
                            endDate={taskEnd}
                            timelineStart={timelineStart}
                            timelineEnd={timelineEnd}
                            color={getTaskColor(task.priority, task.status)}
                            label={task.title}
                            size="small"
                            onClick={() => onTaskClick?.(task)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Tasks without milestones */}
        {tasksByMilestone.has(null) &&
          tasksByMilestone.get(null)!.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-slate-700">
                    No Milestone
                  </p>
                </div>
                <div className="flex-1"></div>
              </div>
              <div className="space-y-2">
                {tasksByMilestone.get(null)!.map((task) => {
                  const { start: taskStart, end: taskEnd } =
                    getTaskDates(task);

                  return (
                    <div key={task.id} className="flex items-center gap-3">
                      <div className="w-48 flex-shrink-0 pl-4">
                        <p className="text-xs text-slate-600 truncate">
                          {task.title}
                        </p>
                      </div>
                      <div className="flex-1">
                        <TimelineBar
                          startDate={taskStart}
                          endDate={taskEnd}
                          timelineStart={timelineStart}
                          timelineEnd={timelineEnd}
                          color={getTaskColor(task.priority, task.status)}
                          label={task.title}
                          size="small"
                          onClick={() => onTaskClick?.(task)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}