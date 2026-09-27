'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ============================================
// Types
// ============================================
export interface AiTask {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours?: number;
}

export interface AiMilestone {
  title: string;
  description?: string;
  durationDays?: number;
  tasks: AiTask[];
}

export interface AiProjectPlan {
  projectName: string;
  description: string;
  milestones: AiMilestone[];
}

export interface TaskBreakdown {
  description: string;
  subtasks: Array<{
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    estimatedHours?: number;
  }>;
  technicalNotes?: string;
}

export interface ProjectRiskAnalysis {
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  risks: Array<{
    title: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
  }>;
  recommendations: string[];
}

export interface ProjectSummary {
  summary: string;
}

// ============================================
// Mutations
// ============================================
export function useGenerateProjectPlan() {
  return useMutation({
    mutationFn: async (data: {
      description: string;
      duration?: string;
      teamSize?: number;
    }): Promise<AiProjectPlan> => {
      const response = await api.post('/ai/generate-project-plan', data);
      return response.data;
    },
  });
}

export function useGenerateTaskBreakdown() {
  return useMutation({
    mutationFn: async (data: {
      taskTitle: string;
      taskDescription?: string;
      projectContext?: string;
    }): Promise<TaskBreakdown> => {
      const response = await api.post('/ai/generate-task-breakdown', data);
      return response.data;
    },
  });
}

export function useAnalyzeProjectRisk() {
  return useMutation({
    mutationFn: async (projectId: string): Promise<ProjectRiskAnalysis> => {
      const response = await api.post('/ai/analyze-project-risk', {
        projectId,
      });
      return response.data;
    },
  });
}

export function useGenerateProjectSummary() {
  return useMutation({
    mutationFn: async (projectId: string): Promise<ProjectSummary> => {
      const response = await api.post('/ai/summarize-project', {
        projectId,
      });
      // Response is plain text (not JSON)
      return { summary: response.data };
    },
  });
}

export function useCreateProjectFromAi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      projectName: string;
      description?: string;
      milestones: AiMilestone[];
      startDate?: string;
    }) => {
      const response = await api.post('/ai/create-project', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', 'organization', variables.organizationId],
      });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useCreateSubtasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      parentTaskId: string;
      subtasks: Array<{
        title: string;
        description?: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      }>;
    }) => {
      const { projectId, parentTaskId, subtasks } = data;

      // Create each subtask as a real task
      const createdTasks = await Promise.all(
        subtasks.map((st) =>
          api.post(`/projects/${projectId}/tasks`, {
            title: st.title,
            description: st.description || `Subtask of task #${parentTaskId}`,
            priority: st.priority,
            status: 'TODO',
          }),
        ),
      );

      return createdTasks;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project', variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}