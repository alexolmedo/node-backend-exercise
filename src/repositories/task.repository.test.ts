import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRepository } from './task.repository';

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new TaskRepository();
  });

  it('should create a task', () => {
    const task = repository.create({
      title: 'Test task',
      status: 'todo'
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test task');
    expect(task.status).toBe('todo');
    expect(task.createdAt).toBeDefined();
    expect(task.updatedAt).toBeDefined();
  });

  it('should find task by id', () => {
    const created = repository.create({ title: 'Find me' });
    const found = repository.findById(created.id);

    expect(found).toEqual(created);
  });

  it('should return undefined for non-existent task', () => {
    const found = repository.findById('non-existent-id');
    expect(found).toBeUndefined();
  });

  it('should filter tasks by status', () => {
    repository.create({ title: 'Todo 1', status: 'todo' });
    repository.create({ title: 'In Progress 1', status: 'in_progress' });
    repository.create({ title: 'Todo 2', status: 'todo' });

    const result = repository.findAll({ status: 'todo' });

    expect(result.tasks).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should search tasks by title', () => {
    repository.create({ title: 'Buy groceries' });
    repository.create({ title: 'Buy tickets' });
    repository.create({ title: 'Sell car' });

    const result = repository.findAll({ q: 'buy' });

    expect(result.tasks).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should paginate results', () => {
    // Create 5 tasks
    for (let i = 1; i <= 5; i++) {
      repository.create({ title: `Task ${i}` });
    }

    const page1 = repository.findAll({ page: 1, pageSize: 2 });
    const page2 = repository.findAll({ page: 2, pageSize: 2 });

    expect(page1.tasks).toHaveLength(2);
    expect(page1.total).toBe(5);
    expect(page2.tasks).toHaveLength(2);
  });

  it('should update a task', async () => {
    const task = repository.create({ title: 'Original', status: 'todo' });

    // Wait 0.5s to ensure a different timestamp
    await new Promise(resolve => setTimeout(resolve, 500));

    const updated = repository.update(task.id, {
      title: 'Updated',
      status: 'done'
    });

    expect(updated?.title).toBe('Updated');
    expect(updated?.status).toBe('done');
    expect(updated?.updatedAt).not.toBe(task.updatedAt);
  });

  it('should delete a task', () => {
    const task = repository.create({ title: 'Delete me' });

    const deleted = repository.delete(task.id);
    expect(deleted).toBe(true);

    const found = repository.findById(task.id);
    expect(found).toBeUndefined();
  });

  it('should return false when deleting non-existent task', () => {
    const deleted = repository.delete('non-existent-id');
    expect(deleted).toBe(false);
  });
});