import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  Organization,
  Project,
  Task,
  Role,
  TaskStatus,
  TaskPriority,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptor
// ============================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// Response Interceptor
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

// ============================================
// ORGANIZATIONS API
// ============================================
export const organizationsApi = {
  list: () => api.get('/organizations'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: { name: string; slug: string; description?: string }) =>
    api.post('/organizations', data),
  update: (id: string, data: Partial<Organization>) =>
    api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  inviteMember: (id: string, data: { email: string; role?: Role }) =>
    api.post(`/organizations/${id}/invite`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/organizations/${id}/members/${userId}`),
  updateMemberRole: (id: string, userId: string, role: Role) =>
    api.patch(`/organizations/${id}/members/${userId}`, { role }),
};

// ============================================
// PROJECTS API
// ============================================
export const projectsApi = {
  listByOrganization: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/projects`),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (
    organizationId: string,
    data: {
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => api.post(`/organizations/${organizationId}/projects`, data),
  update: (id: string, data: Partial<Project>) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, data: { email: string; role?: Role }) =>
    api.post(`/projects/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`),
};

// ============================================
// TASKS API
// ============================================
export const tasksApi = {
  listByProject: (projectId: string) =>
    api.get(`/projects/${projectId}/tasks`),
  get: (id: string) => api.get(`/tasks/${id}`),
  create: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      dueDate?: string;
    },
  ) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id: string, data: Partial<Task>) => api.patch(`/tasks/${id}`, data),
  move: (id: string, data: { status: TaskStatus; order?: number }) =>
    api.patch(`/tasks/${id}/status`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (id: string, content: string) =>
    api.post(`/tasks/${id}/comments`, { content }),
  getComments: (id: string) => api.get(`/tasks/${id}/comments`),
};

// ============================================
// MESSAGES API
// ============================================
export const messagesApi = {
  list: (projectId: string, limit = 50) =>
    api.get(`/projects/${projectId}/messages?limit=${limit}`),
  send: (projectId: string, content: string) =>
    api.post(`/projects/${projectId}/messages`, { content }),
};