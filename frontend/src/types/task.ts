export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = Task['status'];

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
} 