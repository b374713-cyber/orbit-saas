// ============================================
// User
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ============================================
// Organization
// ============================================
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: Pick<User, 'id' | 'email' | 'name'>;
  members?: OrganizationMember[];
  _count?: {
    members: number;
    projects: number;
  };
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
}

// ============================================
// Project
// ============================================
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
export type HealthStatus = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  creatorId: string;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
  organization?: Pick<Organization, 'id' | 'name' | 'slug'>;
  members?: ProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
  progress?: number;
  health?: HealthStatus;
  tasksSummary?: Record<string, number>;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
}

// ============================================
// Milestone
// ============================================
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  dueDate: string | null;
  status: MilestoneStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  tasksCount?: number;
  doneTasksCount?: number;
  _count?: { tasks: number };
  tasks?: any[];
}

// ============================================
// Task
// ============================================
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  milestoneId: string | null;   // ← أضف
  assigneeId: string | null;
  creatorId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  creator?: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
  assignee?: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'> | null;
  milestone?: { id: string; title: string; status: string } | null;   // ← أضف
  project?: Pick<Project, 'id' | 'name'>;
  labels?: TaskLabel[];
  comments?: TaskComment[];
  files?: File[];
  activities?: Activity[];
  _count?: {
    comments: number;
    files: number;
  };
}

export interface TaskLabel {
  id: string;
  taskId: string;
  name: string;
  color: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
}

export interface Activity {
  id: string;
  userId: string;
  taskId: string | null;
  action: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  user: Pick<User, 'id' | 'email' | 'name'>;
}

// ============================================
// Message
// ============================================
export interface Message {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>;
}

// ============================================
// Kanban
// ============================================
export interface KanbanData {
  tasks: Task[];
  kanban: {
    BACKLOG: Task[];
    TODO: Task[];
    IN_PROGRESS: Task[];
    REVIEW: Task[];
    DONE: Task[];
  };
  total: number;
}