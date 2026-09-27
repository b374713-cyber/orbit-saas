'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  X,
  Calendar,
  MessageSquare,
  Clock,
  Trash2,
  Send,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useAddComment,
  useTasks,
} from '@/hooks/useTasks';
import { useMilestones } from '@/hooks/useMilestones';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { DependenciesSection } from './DependenciesSection';
import { AiTaskAssistant } from '../ai/AiTaskAssistant';

interface TaskDetailModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  members?: any[];
}

export function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  members = [],
}: TaskDetailModalProps) {
  const params = useParams();
  const projectId = params.id as string;

  const { data: task, isLoading } = useTask(taskId);
  const { data: milestones } = useMilestones(projectId);
  const { data: tasksData } = useTasks(projectId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addComment = useAddComment();

  const [comment, setComment] = useState('');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTask.mutateAsync({ id: taskId, data: { status } });
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    await updateTask.mutateAsync({ id: taskId, data: { priority } });
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { assigneeId: assigneeId || null } as any,
    });
  };

  const handleMilestoneChange = async (milestoneId: string) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: { milestoneId: milestoneId || null } as any,
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await deleteTask.mutateAsync(taskId);
    onClose();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addComment.mutateAsync({ taskId, content: comment.trim() });
    setComment('');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {task.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Created {formatRelativeTime(task.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => setIsAiAssistantOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-sm"
                title="AI Assist"
              >
                <Sparkles className="w-4 h-4" />
                AI Assist
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </h3>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments ({task.comments?.length || 0})
                  </h3>

                  <div className="space-y-3 mb-4">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {getInitials(c.user.name)}
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-900">
                                {c.user.name}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatRelativeTime(c.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        No comments yet
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      style={{ color: '#0f172a' }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!comment.trim() || addComment.isPending}
                      className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Dependencies */}
                <div className="pt-6 border-t border-slate-200">
                  <DependenciesSection
                    taskId={taskId}
                    projectId={projectId}
                    allTasks={tasksData?.tasks || []}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as TaskStatus)
                    }
                    style={{ color: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Priority
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      handlePriorityChange(e.target.value as TaskPriority)
                    }
                    style={{ color: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Milestone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Milestone
                  </label>
                  {task.milestone && (
                    <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900">
                        {task.milestone.title}
                      </p>
                    </div>
                  )}
                  <select
                    value={task.milestoneId || ''}
                    onChange={(e) => handleMilestoneChange(e.target.value)}
                    style={{ color: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="">No milestone</option>
                    {milestones?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Assignee
                  </label>
                  {task.assignee ? (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {getInitials(task.assignee.name)}
                      </div>
                      <span className="text-sm text-slate-700">
                        {task.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 mb-2">Unassigned</p>
                  )}
                  <select
                    value={task.assigneeId || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    style={{ color: '#0f172a' }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m: any) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                      Due Date
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-700">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Activity */}
                {task.activities && task.activities.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                      Recent Activity
                    </label>
                    <div className="space-y-2">
                      {task.activities.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className="text-xs text-slate-600 flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                          <div>
                            <span className="font-medium">{a.user.name}</span>{' '}
                            <span className="text-slate-500">
                              {a.action.toLowerCase().replace(/_/g, ' ')}
                            </span>
                            <p className="text-slate-400 mt-0.5">
                              {formatRelativeTime(a.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Task Assistant Modal */}
      <AiTaskAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        projectId={projectId}
        taskTitle={task.title}
        taskDescription={task.description || undefined}
        projectContext={task.project?.name}
      />
    </>
  );
}