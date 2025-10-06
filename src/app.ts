import Fastify, {FastifyInstance, FastifyServerOptions} from 'fastify';
import cors from '@fastify/cors';
import taskRoutes from './routes/tasks';
import {AppError} from './utils/errors';

export async function build(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  // Register plugins
  await app.register(cors);

  // Health check
  app.get('/health', async () => {
    return {status: 'ok', timestamp: new Date().toISOString()};
  });

  // Register task routes
  await app.register(taskRoutes, {prefix: '/tasks'});

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        statusCode: 404,
        message: `Route ${request.method}:${request.url} not found`
      }
    });
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    // Log error
    request.log.error({
      err: error,
      url: request.url,
      method: request.method
    }, 'Request error');

    // Handle custom AppError
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          statusCode: error.statusCode,
          message: error.message
        }
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: {
          statusCode: 400,
          message: 'Validation error',
          details: error.validation
        }
      });
    }

    // Handle generic errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500
        ? 'Internal Server Error'
        : error.message;

    return reply.status(statusCode).send({
      error: {
        statusCode,
        message
      }
    });
  });

  return app;
}