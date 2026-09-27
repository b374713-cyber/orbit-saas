'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Task, TaskStatus, KanbanData, ProjectMember } from '@/types';
import { useMoveTask } from '@/hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { TaskDetailModal } from '../tasks/TaskDetailModal';

interface KanbanBoardProps {
  projectId: string;
  data: KanbanData;
  members?: ProjectMember[];
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'BACKLOG', title: 'Backlog' },
  { status: 'TODO', title: 'To Do' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'REVIEW', title: 'Review' },
  { status: 'DONE', title: 'Done' },
];

export function KanbanBoard({ projectId, data, members = [] }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('TODO');

  const moveTask = useMoveTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current as Task;
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = active.data.current as Task;

    if (task.status === newStatus) return;

    try {
      await moveTask.mutateAsync({ id: taskId, status: newStatus });
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={data.kanban[col.status] || []}
              onAddTask={handleAddTask}
              onTaskClick={(task) => setSelectedTaskId(task.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        defaultStatus={defaultStatus}
        members={members}
      />

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          members={members}
        />
      )}
    </>
  );
}