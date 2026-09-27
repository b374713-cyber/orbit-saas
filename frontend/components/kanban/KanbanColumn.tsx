'use client';

import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const statusConfig: Record<
  TaskStatus,
  { title: string; color: string; bgColor: string }
> = {
  BACKLOG: {
    title: 'Backlog',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },
  TODO: {
    title: 'To Do',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  IN_PROGRESS: {
    title: 'In Progress',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
  },
  REVIEW: {
    title: 'Review',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  DONE: {
    title: 'Done',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
};

export function KanbanColumn({
  status,
  tasks,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const config = statusConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl bg-slate-50 border-2 transition ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
      }`}
      style={{ minHeight: '600px' }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded hover:bg-slate-200 transition"
          title="Add task"
        >
          <Plus className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}