'use client';

import { useQuery } from '@tanstack/react-query';
import { organizationsApi, projectsApi, tasksApi } from '@/lib/api';
import type { Organization, Project, Task } from '@/types';

export interface DashboardStats {
  organizations: number;
  projects: number;
  tasks: number;
  teamMembers: number;
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const {
    data: organizations,
    isLoading: orgsLoading,
  } = useQuery<Organization[]>({
    queryKey: ['dashboard', 'organizations'],
    queryFn: async () => {
      const { data } = await organizationsApi.list();
      return data;
    },
  });

  const {
    data: projects,
    isLoading: projectsLoading,
  } = useQuery<Project[]>({
    queryKey: ['dashboard', 'projects', organizations?.map((o) => o.id)],
    queryFn: async () => {
      if (!organizations || organizations.length === 0) return [];

      const results = await Promise.all(
        organizations.map(async (org) => {
          try {
            const { data } = await projectsApi.listByOrganization(org.id);
            return data as Project[];
          } catch {
            return [];
          }
        }),
      );

      return results.flat();
    },
    enabled: !!organizations && organizations.length > 0,
  });

  const {
    data: tasks,
    isLoading: tasksLoading,
  } = useQuery<Task[]>({
    queryKey: ['dashboard', 'tasks', projects?.map((p) => p.id)],
    queryFn: async () => {
      if (!projects || projects.length === 0) return [];

      const results = await Promise.all(
        projects.map(async (project) => {
          try {
            const { data } = await tasksApi.listByProject(project.id);
            return data as Task[];
          } catch {
            return [];
          }
        }),
      );

      return results.flat();
    },
    enabled: !!projects && projects.length > 0,
  });

  // Team members = unique user IDs across all orgs
  const teamMemberIds = new Set<string>();
  organizations?.forEach((org: any) => {
    org.members?.forEach((m: any) => teamMemberIds.add(m.userId));
  });

  return {
    organizations: organizations?.length ?? 0,
    projects: projects?.length ?? 0,
    tasks: tasks?.length ?? 0,
    teamMembers: teamMemberIds.size,
    isLoading: orgsLoading || projectsLoading || tasksLoading,
  };
}