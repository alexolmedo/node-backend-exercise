import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {build} from '../app';
import {FastifyInstance} from 'fastify';
import {taskRepository} from '../repositories/task.repository';

describe('Task Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await build();
    taskRepository.clear(); // Clean state
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Test task',
          status: 'todo'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.id).toBeDefined();
      expect(body.title).toBe('Test task');
      expect(body.status).toBe('todo');
    });

    it('should create task with default status', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Test task'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('todo');
    });

    it('should reject empty title', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: ''
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject invalid status', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Test',
          status: 'invalid'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Todo 1', status: 'todo'}
      });
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'In Progress', status: 'in_progress'}
      });
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Todo 2', status: 'todo'}
      });
    });

    it('should list all tasks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(3);
      expect(body.pagination.total).toBe(3);
    });

    it('should filter by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks?status=todo'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.data.every((t: any) => t.status === 'todo')).toBe(true);
    });

    it('should search by title', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks?q=progress'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toContain('Progress');
    });

    it('should paginate results', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks?page=1&pageSize=2'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.pageSize).toBe(2);
      expect(body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should get task by id', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Test task'}
      });
      const created = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${created.id}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(created.id);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks/non-existent-id'
      });

      console.log(response)

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('not found');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update task', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Original'}
      });
      const created = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'PATCH',
        url: `/tasks/${created.id}`,
        payload: {
          title: 'Updated',
          status: 'done'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.title).toBe('Updated');
      expect(body.status).toBe('done');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/tasks/non-existent-id',
        payload: {title: 'Updated'}
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete task', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Delete me'}
      });
      const created = JSON.parse(createResponse.body);

      const response = await app.inject({
        method: 'DELETE',
        url: `/tasks/${created.id}`
      });

      expect(response.statusCode).toBe(204);

      // Verify deletion
      const getResponse = await app.inject({
        method: 'GET',
        url: `/tasks/${created.id}`
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/tasks/non-existent-id'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /tasks/stats', () => {
    it('should return task statistics', async () => {
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Todo', status: 'todo'}
      });
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {title: 'Done', status: 'done'}
      });

      const response = await app.inject({
        method: 'GET',
        url: '/tasks/stats'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.total).toBe(2);
      expect(body.byStatus.todo).toBe(1);
      expect(body.byStatus.done).toBe(1);
    });
  });
});