'use client';

import { useDraggable } from '@dnd-kit/core';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { Task } from '@/types';
import { getPriorityColor, formatDate } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: task,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priorityClass = getPriorityColor(task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      {/* Priority + Due Date */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityClass}`}
        >
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-slate-600 truncate max-w-[80px]">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {task._count?.comments ? (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task._count.comments}
            </span>
          ) : null}
          {task._count?.files ? (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {task._count.files}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}