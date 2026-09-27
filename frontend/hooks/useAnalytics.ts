'use client';

import { useMemo } from 'react';
import { Task, Project } from '@/types';

interface AnalyticsData {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;

  tasksByStatus: Array<{ name: string; value: number; color: string }>;
  tasksByPriority: Array<{ name: string; value: number; color: string }>;

  teamWorkload: Array<{
    userId: string;
    name: string;
    avatarUrl: string | null;
    activeTasks: number;
    completedTasks: number;
  }>;

  velocity: Array<{ week: string; completed: number }>;

  progressOverTime: Array<{ date: string; progress: number }>;
}

export function useAnalytics(
  project: Project | undefined,
  tasks: Task[],
): AnalyticsData {
  return useMemo(() => {
    if (!project || !tasks) {
      return {
        totalTasks: 0,
        doneTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        tasksByStatus: [],
        tasksByPriority: [],
        teamWorkload: [],
        velocity: [],
        progressOverTime: [],
      };
    }

    const now = new Date();

    // Basic Stats
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === 'IN_PROGRESS',
    ).length;
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== 'DONE',
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Tasks by Status (Pie chart)
    const statusConfig = {
      BACKLOG: { name: 'Backlog', color: '#94a3b8' },
      TODO: { name: 'To Do', color: '#3b82f6' },
      IN_PROGRESS: { name: 'In Progress', color: '#eab308' },
      REVIEW: { name: 'Review', color: '#a855f7' },
      DONE: { name: 'Done', color: '#22c55e' },
    };

    const tasksByStatus = Object.entries(statusConfig).map(
      ([status, config]) => ({
        name: config.name,
        value: tasks.filter((t) => t.status === status).length,
        color: config.color,
      }),
    );

    // Tasks by Priority (Bar chart)
    const priorityConfig = {
      LOW: { name: 'Low', color: '#94a3b8' },
      MEDIUM: { name: 'Medium', color: '#3b82f6' },
      HIGH: { name: 'High', color: '#f97316' },
      URGENT: { name: 'Urgent', color: '#ef4444' },
    };

    const tasksByPriority = Object.entries(priorityConfig).map(
      ([priority, config]) => ({
        name: config.name,
        value: tasks.filter((t) => t.priority === priority).length,
        color: config.color,
      }),
    );

    // Team Workload
    const workloadMap = new Map<
      string,
      {
        userId: string;
        name: string;
        avatarUrl: string | null;
        activeTasks: number;
        completedTasks: number;
      }
    >();

    tasks.forEach((task) => {
      if (task.assignee) {
        const existing = workloadMap.get(task.assignee.id) || {
          userId: task.assignee.id,
          name: task.assignee.name,
          avatarUrl: task.assignee.avatarUrl,
          activeTasks: 0,
          completedTasks: 0,
        };

        if (task.status === 'DONE') {
          existing.completedTasks++;
        } else {
          existing.activeTasks++;
        }

        workloadMap.set(task.assignee.id, existing);
      }
    });

    const teamWorkload = Array.from(workloadMap.values()).sort(
      (a, b) => b.activeTasks - a.activeTasks,
    );

    // Velocity (Tasks completed per week - last 4 weeks)
    const velocity: Array<{ week: string; completed: number }> = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const completed = tasks.filter(
        (t) =>
          t.status === 'DONE' &&
          new Date(t.updatedAt) >= weekStart &&
          new Date(t.updatedAt) < weekEnd,
      ).length;

      velocity.push({
        week: `Week ${4 - i}`,
        completed,
      });
    }

    // Progress Over Time (last 7 days)
    const progressOverTime: Array<{ date: string; progress: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Calculate progress at that date
      const tasksAtDate = tasks.filter(
        (t) => new Date(t.createdAt) <= date,
      );
      const doneAtDate = tasksAtDate.filter(
        (t) =>
          t.status === 'DONE' &&
          new Date(t.updatedAt) <= date,
      ).length;

      const progress =
        tasksAtDate.length > 0
          ? Math.round((doneAtDate / tasksAtDate.length) * 100)
          : 0;

      progressOverTime.push({
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        progress,
      });
    }

    return {
      totalTasks,
      doneTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      tasksByStatus,
      tasksByPriority,
      teamWorkload,
      velocity,
      progressOverTime,
    };
  }, [project, tasks]);
}