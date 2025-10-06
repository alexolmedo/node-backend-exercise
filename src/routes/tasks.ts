import {FastifyPluginAsync} from 'fastify';
import {taskService} from '../services/task.service';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams
} from '../types/task.types';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  deleteTaskSchema,
  listTasksSchema,
  statsSchema
} from '../schemas/task.schema';

const taskRoutes: FastifyPluginAsync = async (fastify) => {

  // POST /tasks - Create a new task
  fastify.post<{ Body: CreateTaskInput }>(
      '/',
      {schema: createTaskSchema},
      async (request, reply) => {
        const task = await taskService.createTask(request.body);

        request.log.info({taskId: task.id}, 'Task created');

        return reply.status(201).send(task);
      }
  );

  // GET /tasks - List tasks with filters and pagination
  fastify.get<{ Querystring: TaskQueryParams }>(
      '/',
      {schema: listTasksSchema},
      async (request, reply) => {
        const result = await taskService.listTasks(request.query);

        request.log.info(
            {
              count: result.data.length,
              total: result.pagination.total,
              filters: request.query
            },
            'Tasks listed'
        );

        return reply.send(result);
      }
  );

  // GET /tasks/stats - Get task statistics (bonus feature)
  fastify.get(
      '/stats',
      {schema: statsSchema},
      async (request, reply) => {
        const stats = await taskService.getStats();

        request.log.info(stats, 'Task statistics retrieved');

        return reply.send(stats);
      }
  );

  // GET /tasks/:id - Get a specific task
  fastify.get<{ Params: { id: string } }>(
      '/:id',
      {schema: getTaskSchema},
      async (request, reply) => {
        const task = await taskService.getTaskById(request.params.id);

        request.log.info({taskId: task.id}, 'Task retrieved');

        return reply.send(task);
      }
  );

  // PATCH /tasks/:id - Update a task
  fastify.patch<{
    Params: { id: string };
    Body: UpdateTaskInput;
  }>(
      '/:id',
      {schema: updateTaskSchema},
      async (request, reply) => {
        const task = await taskService.updateTask(
            request.params.id,
            request.body
        );

        request.log.info(
            {taskId: task.id, updates: request.body},
            'Task updated'
        );

        return reply.send(task);
      }
  );

  // DELETE /tasks/:id - Delete a task
  fastify.delete<{ Params: { id: string } }>(
      '/:id',
      {schema: deleteTaskSchema},
      async (request, reply) => {
        await taskService.deleteTask(request.params.id);

        request.log.info({taskId: request.params.id}, 'Task deleted');

        return reply.status(204).send();
      }
  );
};

export default taskRoutes;