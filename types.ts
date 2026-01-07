
export type TaskStatus = 'In Progress' | 'In Review' | 'Completed';
export type TaskCategory = 'General' | 'Demo' | 'Element' | 'Migration';

export interface EODUpdate {
  date: string;
  progress: number; // 0-100
  status: TaskStatus;
  workCompleted: string;
  pendingItems: string;
  blockers?: string;
  expectedCompletionDate: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  category: TaskCategory;
  assignee: string;
  startDate: string;
  targetDate: string;
  updates: EODUpdate[];
  leadComments?: string[];
}

export interface Project {
  id: string;
  name: string;
}

export type TeamMember = string;
