'use client';

import { useState } from 'react';
import {
  Sparkles,
  X,
  Loader2,
  Wand2,
  Plus,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import {
  useGenerateTaskBreakdown,
  useCreateSubtasks,
  TaskBreakdown,
} from '@/hooks/useAi';
import { getPriorityColor } from '@/lib/utils';

interface AiTaskAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  taskTitle: string;
  taskDescription?: string;
  projectContext?: string;
}

export function AiTaskAssistant({
  isOpen,
  onClose,
  projectId,
  taskTitle,
  taskDescription,
  projectContext,
}: AiTaskAssistantProps) {
  const [breakdown, setBreakdown] = useState<TaskBreakdown | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateBreakdown = useGenerateTaskBreakdown();
  const createSubtasks = useCreateSubtasks();

  const handleGenerate = async () => {
    setError('');
    setSuccess('');

    try {
      const result = await generateBreakdown.mutateAsync({
        taskTitle,
        taskDescription,
        projectContext,
      });
      setBreakdown(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate breakdown');
    }
  };

  const handleCreateSubtasks = async () => {
    if (!breakdown) return;

    setError('');
    try {
      await createSubtasks.mutateAsync({
        projectId,
        parentTaskId: '',
        subtasks: breakdown.subtasks.map((st) => ({
          title: st.title,
          priority: st.priority as
            | 'LOW'
            | 'MEDIUM'
            | 'HIGH'
            | 'URGENT',
        })),
      });

      setSuccess(`${breakdown.subtasks.length} subtasks created!`);

      setTimeout(() => {
        onClose();
        setBreakdown(null);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subtasks');
    }
  };

  const handleClose = () => {
    setBreakdown(null);
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                AI Task Assistant
              </h2>
              <p className="text-xs text-slate-500">
                Break down your task into subtasks
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Task Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">
              Task
            </p>
            <p className="font-semibold text-slate-900">{taskTitle}</p>
            {taskDescription && (
              <p className="text-xs text-slate-600 mt-1">{taskDescription}</p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Initial state */}
          {!breakdown && !generateBreakdown.isPending && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Let AI break it down
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                AI will analyze this task and suggest 3-8 actionable subtasks
                with priorities and time estimates.
              </p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
              >
                <Sparkles className="w-5 h-5" />
                Generate Subtasks
              </button>
            </div>
          )}

          {/* Loading state */}
          {generateBreakdown.isPending && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                AI is analyzing your task...
              </h3>
              <p className="text-sm text-slate-600">
                Breaking it down into actionable steps
              </p>
            </div>
          )}

          {/* Result */}
          {breakdown && !generateBreakdown.isPending && (
            <div className="space-y-4">
              {/* Improved Description */}
              {breakdown.description && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs font-medium text-blue-700 uppercase mb-1">
                    💡 Improved Description
                  </p>
                  <p className="text-sm text-slate-700">
                    {breakdown.description}
                  </p>
                </div>
              )}

              {/* Subtasks */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Suggested Subtasks ({breakdown.subtasks.length})
                </h3>
                <div className="space-y-2">
                  {breakdown.subtasks.map((subtask, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {subtask.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(subtask.priority)}`}
                          >
                            {subtask.priority}
                          </span>
                          {subtask.estimatedHours && (
                            <span className="text-xs text-slate-500">
                              ~{subtask.estimatedHours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Notes */}
              {breakdown.technicalNotes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 uppercase mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Technical Notes
                  </p>
                  <p className="text-sm text-slate-700">
                    {breakdown.technicalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {breakdown && !generateBreakdown.isPending && (
          <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handleGenerate}
              disabled={createSubtasks.isPending}
              className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition disabled:opacity-50"
            >
              Regenerate
            </button>
            <button
              onClick={handleCreateSubtasks}
              disabled={createSubtasks.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-md"
            >
              {createSubtasks.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create {breakdown.subtasks.length} Subtasks
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}