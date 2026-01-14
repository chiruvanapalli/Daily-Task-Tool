
export type TaskStatus = 'In Progress' | 'In Review' | 'Completed';
export type TaskCategory = 'General' | 'Demo' | 'Element' | 'Migration';
export type HealthStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Review Required';

export interface EODUpdate {
  date: string;
  progress: number; // 0-100
  status: TaskStatus;
  workCompleted: string;
  pendingItems: string;
  blockers?: string;
  expectedCompletionDate: string;
  updatedAt: number; // For sync merging
}

export interface Task {
  id: string;
  title: string;
  project: string;
  sprint?: string;
  category: TaskCategory;
  assignee: string;
  startDate: string;
  targetDate: string;
  updates: EODUpdate[];
  leadComments?: string[];
  healthStatus?: HealthStatus;
  updatedAt: number; // Global task timestamp
}

export interface Project {
  id: string;
  name: string;
}

export type TeamMember = string;
