import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams,
  PaginatedResponse
} from '../types/task.types';
import {taskRepository, TaskRepository} from '../repositories/task.repository';
import {NotFoundError, ValidationError} from '../utils/errors';

export class TaskService {
  constructor(private repository: TaskRepository) {
  }

  /**
   * Create a new task with validation
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    // Validate title
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError('Title is required and cannot be empty');
    }

    if (input.title.length > 200) {
      throw new ValidationError('Title cannot exceed 200 characters');
    }

    // Validate dueDate if provided
    if (input.dueDate) {
      const dueDate = new Date(input.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Invalid dueDate format. Use ISO8601 format');
      }
    }

    // Validate status if provided
    if (input.status && !['todo', 'in_progress', 'done'].includes(input.status)) {
      throw new ValidationError('Status must be one of: todo, in_progress, done');
    }

    return this.repository.create(input);
  }

  /**
   * Get a task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const task = this.repository.findById(id);

    if (!task) {
      throw new NotFoundError('Task', id);
    }

    return task;
  }

  /**
   * List tasks with filtering and pagination
   */
  async listTasks(params: TaskQueryParams): Promise<PaginatedResponse<Task>> {
    // Set defaults
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0
        ? Math.min(params.pageSize, 100) // Max 100 items per page
        : 10;

    // Validate status if provided
    if (params.status && !['todo', 'in_progress', 'done'].includes(params.status)) {
      throw new ValidationError('Invalid status. Must be one of: todo, in_progress, done');
    }

    const {tasks, total} = this.repository.findAll({
      ...params,
      page,
      pageSize
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: tasks,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    };
  }

  /**
   * Update a task (partial update)
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    // Check if task exists
    const existingTask = this.repository.findById(id);
    if (!existingTask) {
      throw new NotFoundError('Task', id);
    }

    // Validate updates
    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        throw new ValidationError('Title cannot be empty');
      }
      if (input.title.length > 200) {
        throw new ValidationError('Title cannot exceed 200 characters');
      }
    }

    if (input.status && !['todo', 'in_progress', 'done'].includes(input.status)) {
      throw new ValidationError('Status must be one of: todo, in_progress, done');
    }

    if (input.dueDate !== undefined) {
      // Allow null/empty to clear dueDate
      if (input.dueDate) {
        const dueDate = new Date(input.dueDate);
        if (isNaN(dueDate.getTime())) {
          throw new ValidationError('Invalid dueDate format. Use ISO8601 format');
        }
      }
    }

    const updated = this.repository.update(id, input);

    // This shouldn't happen, but type safety
    if (!updated) {
      throw new NotFoundError('Task', id);
    }

    return updated;
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const deleted = this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Task', id);
    }
  }

  /**
   * Get task statistics (bonus feature)
   */
  async getStats() {
    const {tasks} = this.repository.findAll({});

    return {
      total: tasks.length,
      byStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length
      },
      overdue: tasks.filter(t =>
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
      ).length
    };
  }
}

// Singleton instance
export const taskService = new TaskService(taskRepository);