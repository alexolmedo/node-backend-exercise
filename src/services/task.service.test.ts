import {describe, it, expect, beforeEach} from 'vitest';
import {TaskService} from './task.service';
import {TaskRepository} from '../repositories/task.repository';
import {NotFoundError, ValidationError} from '../utils/errors';

describe('TaskService', () => {
  let service: TaskService;
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
    service = new TaskService(repository);
  });

  describe('createTask', () => {
    it('should create a valid task', async () => {
      const task = await service.createTask({
        title: 'Test task',
        status: 'todo'
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test task');
      expect(task.status).toBe('todo');
    });

    it('should create task with default status', async () => {
      const task = await service.createTask({
        title: 'Test task'
      });

      expect(task.status).toBe('todo');
    });

    it('should create task with dueDate', async () => {
      const dueDate = new Date().toISOString();
      const task = await service.createTask({
        title: 'Test task',
        dueDate
      });

      expect(task.dueDate).toBe(dueDate);
    });

    it('should throw error for empty title', async () => {
      await expect(
          service.createTask({title: ''})
      ).rejects.toThrow(ValidationError);

      await expect(
          service.createTask({title: '   '})
      ).rejects.toThrow('Title is required and cannot be empty');
    });

    it('should throw error for title too long', async () => {
      const longTitle = 'a'.repeat(201);

      await expect(
          service.createTask({title: longTitle})
      ).rejects.toThrow('Title cannot exceed 200 characters');
    });

    it('should throw error for invalid status', async () => {
      await expect(
          service.createTask({
            title: 'Test',
            status: 'invalid' as any
          })
      ).rejects.toThrow('Status must be one of');
    });

    it('should throw error for invalid dueDate', async () => {
      await expect(
          service.createTask({
            title: 'Test',
            dueDate: 'invalid-date'
          })
      ).rejects.toThrow('Invalid dueDate format');
    });
  });

  describe('getTaskById', () => {
    it('should return task by id', async () => {
      const created = await service.createTask({title: 'Test'});
      const found = await service.getTaskById(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
          service.getTaskById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('listTasks', () => {
    beforeEach(async () => {
      await service.createTask({title: 'Todo 1', status: 'todo'});
      await service.createTask({title: 'In Progress', status: 'in_progress'});
      await service.createTask({title: 'Todo 2', status: 'todo'});
      await service.createTask({title: 'Done', status: 'done'});
    });

    it('should list all tasks with pagination', async () => {
      const result = await service.listTasks({});

      expect(result.data).toHaveLength(4);
      expect(result.pagination.total).toBe(4);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
    });

    it('should filter by status', async () => {
      const result = await service.listTasks({status: 'todo'});

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.data.every(t => t.status === 'todo')).toBe(true);
    });

    it('should search by title', async () => {
      const result = await service.listTasks({q: 'todo'});

      expect(result.data).toHaveLength(2);
      expect(result.data.every(t => t.title.toLowerCase().includes('todo'))).toBe(true);
    });

    it('should paginate results', async () => {
      const page1 = await service.listTasks({page: 1, pageSize: 2});
      const page2 = await service.listTasks({page: 2, pageSize: 2});

      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(2);
      expect(page1.pagination.totalPages).toBe(2);
    });

    it('should enforce max page size', async () => {
      const result = await service.listTasks({pageSize: 1000});

      expect(result.pagination.pageSize).toBe(100);
    });

    it('should throw error for invalid status', async () => {
      await expect(
          service.listTasks({status: 'invalid' as any})
      ).rejects.toThrow('Invalid status');
    });
  });

  describe('updateTask', () => {
    it('should update task fields', async () => {
      const task = await service.createTask({title: 'Original'});

      // Wait 0.5s to ensure a different timestamp
      await new Promise(resolve => setTimeout(resolve, 500));

      const updated = await service.updateTask(task.id, {
        title: 'Updated',
        status: 'done'
      });

      expect(updated.title).toBe('Updated');
      expect(updated.status).toBe('done');
      expect(updated.updatedAt).not.toBe(task.updatedAt);
    });

    it('should allow partial updates', async () => {
      const task = await service.createTask({title: 'Original', status: 'todo'});

      const updated = await service.updateTask(task.id, {
        status: 'in_progress'
      });

      expect(updated.title).toBe('Original');
      expect(updated.status).toBe('in_progress');
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
          service.updateTask('non-existent-id', {title: 'Updated'})
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw error for empty title', async () => {
      const task = await service.createTask({title: 'Original'});

      await expect(
          service.updateTask(task.id, {title: ''})
      ).rejects.toThrow('Title cannot be empty');
    });

    it('should throw error for invalid status', async () => {
      const task = await service.createTask({title: 'Test'});

      await expect(
          service.updateTask(task.id, {status: 'invalid' as any})
      ).rejects.toThrow('Status must be one of');
    });
  });

  describe('deleteTask', () => {
    it('should delete existing task', async () => {
      const task = await service.createTask({title: 'Delete me'});

      await service.deleteTask(task.id);

      await expect(
          service.getTaskById(task.id)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
          service.deleteTask('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getStats', () => {
    it('should return task statistics', async () => {
      await service.createTask({title: 'Todo', status: 'todo'});
      await service.createTask({title: 'In Progress', status: 'in_progress'});
      await service.createTask({title: 'Done', status: 'done'});

      const stats = await service.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byStatus.todo).toBe(1);
      expect(stats.byStatus.in_progress).toBe(1);
      expect(stats.byStatus.done).toBe(1);
    });

    it('should count overdue tasks', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();

      await service.createTask({
        title: 'Overdue',
        status: 'todo',
        dueDate: yesterday
      });

      const stats = await service.getStats();

      expect(stats.overdue).toBe(1);
    });
  });
});