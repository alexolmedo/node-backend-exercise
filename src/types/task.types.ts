export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface TaskQueryParams {
  status?: TaskStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}