import {randomUUID} from 'crypto';
import {Task, CreateTaskInput, UpdateTaskInput, TaskQueryParams} from '../types/task.types';

export class TaskRepository {
  // In-memory task storage
  private tasks: Map<string, Task> = new Map();

  /**
   * Create a new task
   */
  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      status: input.status || 'todo',
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Find a task by ID
   */
  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Find all tasks with optional filtering and pagination
   */
  findAll(params: TaskQueryParams = {}): { tasks: Task[]; total: number } {
    let filtered = Array.from(this.tasks.values());

    // Filter by status
    if (params.status) {
      filtered = filtered.filter(task => task.status === params.status);
    }

    // Search in title (case-insensitive)
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(task =>
          task.title.toLowerCase().includes(query)
      );
    }

    // Sort by createdAt (newest first)
    filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filtered.length;

    // Pagination
    if (params.page !== undefined && params.pageSize !== undefined) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      filtered = filtered.slice(start, end);
    }

    return {tasks: filtered, total};
  }

  /**
   * Update a task (partial update)
   */
  update(id: string, input: UpdateTaskInput): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Delete a task by ID
   */
  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * Clear all tasks (useful for testing)
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * Get total count of tasks
   */
  count(): number {
    return this.tasks.size;
  }
}

// Singleton instance
export const taskRepository = new TaskRepository();