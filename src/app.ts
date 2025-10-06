import Fastify, {FastifyInstance, FastifyServerOptions} from 'fastify';
import cors from '@fastify/cors';

export async function build(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(opts);

  // Register plugins
  await app.register(cors);

  // Health check
  app.get('/health', async () => {
    return {status: 'ok', timestamp: new Date().toISOString()};
  });

  // Register routes
  // await app.register(taskRoutes, { prefix: '/tasks' });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    reply.status(error.statusCode || 500).send({
      error: {
        message: error.message || 'Internal Server Error',
        statusCode: error.statusCode || 500
      }
    });
  });

  return app;
}