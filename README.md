# Tasks REST API

A production-ready REST API for managing tasks, built with Node.js, Fastify, and TypeScript.

## Features

✅ Full CRUD operations for tasks  
✅ Filtering, search, and pagination  
✅ JSON Schema validation  
✅ Comprehensive error handling  
✅ Request logging with Pino  
✅ Unit & integration tests  
✅ Docker support  
✅ TypeScript with strict mode  
✅ In-memory data persistence

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Fastify 5.x
- **Language**: TypeScript 5.x
- **Testing**: Vitest
- **Logging**: Pino
- **Containerization**: Docker

---

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- Docker (optional)

### Local Development

    # Clone repository
    git clone <repository-url> tasks-api
    cd tasks-api

    # Install dependencies
    npm install

    # Run in development mode (with hot reload)
    npm run dev

    # Run tests
    npm test

    # Run tests with coverage
    npm run test:coverage

    # Type check
    npm run lint

Server will start at `http://localhost:3000`

### Production Build

    # Build TypeScript
    npm run build

    # Start production server
    npm start

---

## Docker

### Using Docker

    # Build image
    docker build -t tasks-api .

    # Run container
    docker run -p 3000:3000 tasks-api

    # Or use npm scripts
    npm run docker:build
    npm run docker:run

### Using Docker Compose

    # Start service
    docker-compose up -d

    # View logs
    docker-compose logs -f

    # Stop service
    docker-compose down

---

## API Documentation

### Base URL

    http://localhost:3000

### Endpoints

#### Health Check

    GET /health

**Response**: `200 OK`

    {
      "status": "ok",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }

---

#### Create Task

    POST /tasks
    Content-Type: application/json

    {
      "title": "Buy groceries",
      "status": "todo",
      "dueDate": "2024-12-31T23:59:59Z"
    }

**Response**: `201 Created`

    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "status": "todo",
      "dueDate": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }

**Fields**:
- `title` (required): Task title (1-200 characters)
- `status` (optional): One of `todo`, `in_progress`, `done` (default: `todo`)
- `dueDate` (optional): ISO8601 date-time string

---

#### List Tasks

    GET /tasks?status=todo&q=groceries&page=1&pageSize=10

**Query Parameters**:
- `status` (optional): Filter by status (`todo`, `in_progress`, `done`)
- `q` (optional): Search in title (case-insensitive)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10, max: 100)

**Response**: `200 OK`

    {
      "data": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "title": "Buy groceries",
          "status": "todo",
          "dueDate": "2024-12-31T23:59:59Z",
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 10,
        "total": 1,
        "totalPages": 1
      }
    }

---

#### Get Task by ID

    GET /tasks/:id

**Response**: `200 OK`

    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "status": "todo",
      "dueDate": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }

**Errors**:
- `404 Not Found`: Task not found

---

#### Update Task

    PATCH /tasks/:id
    Content-Type: application/json

    {
      "status": "done"
    }

**Note**: Partial updates supported. Only provide fields you want to update.

**Response**: `200 OK`

    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "status": "done",
      "dueDate": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }

**Errors**:
- `404 Not Found`: Task not found
- `400 Bad Request`: Invalid input

---

#### Delete Task

    DELETE /tasks/:id

**Response**: `204 No Content`

**Errors**:
- `404 Not Found`: Task not found

---

#### Get Statistics (Bonus)

    GET /tasks/stats

**Response**: `200 OK`

    {
      "total": 10,
      "byStatus": {
        "todo": 5,
        "in_progress": 3,
        "done": 2
      },
      "overdue": 1
    }

---

## Example cURL Requests

    # Create a task
    curl -X POST http://localhost:3000/tasks \
      -H "Content-Type: application/json" \
      -d '{"title":"Complete project documentation","status":"in_progress","dueDate":"2024-12-31T23:59:59Z"}'

    # List all tasks
    curl http://localhost:3000/tasks

    # Filter tasks by status
    curl "http://localhost:3000/tasks?status=todo"

    # Search tasks
    curl "http://localhost:3000/tasks?q=documentation"

    # Paginate results
    curl "http://localhost:3000/tasks?page=1&pageSize=5"

    # Combine filters
    curl "http://localhost:3000/tasks?status=todo&q=project&page=1&pageSize=10"

    # Get specific task
    curl http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000

    # Update task
    curl -X PATCH http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000 \
      -H "Content-Type: application/json" \
      -d '{"status":"done"}'

    # Delete task
    curl -X DELETE http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000

    # Get statistics
    curl http://localhost:3000/tasks/stats

---

## Error Handling

All errors follow a consistent format:

    {
      "error": {
        "statusCode": 400,
        "message": "Validation error",
        "details": [...]
      }
    }

### HTTP Status Codes

- `200 OK`: Successful GET/PATCH request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Validation error or invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Project Structure

    tasks-api/
    ├── src/
    │   ├── routes/
    │   │   └── tasks.ts              # API routes
    │   ├── services/
    │   │   └── task.service.ts       # Business logic
    │   ├── repositories/
    │   │   └── task.repository.ts    # Data access layer
    │   ├── schemas/
    │   │   └── task.schema.ts        # JSON schemas
    │   ├── types/
    │   │   └── task.types.ts         # TypeScript types
    │   ├── utils/
    │   │   └── errors.ts             # Custom error classes
    │   ├── app.ts                    # Fastify app setup
    │   └── server.ts                 # Entry point
    ├── dist/                         # Compiled JavaScript
    ├── node_modules/
    ├── .dockerignore
    ├── .env.example
    ├── .gitignore
    ├── docker-compose.yml
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── README.md

---

## Design Decisions & Trade-offs

### Architecture

**Layered Architecture**: Separated concerns into routes, services, and repositories for:
- ✅ Better testability
- ✅ Clear separation of concerns
- ✅ Easier to maintain and extend
- ❌ More files for a simple API (acceptable for demonstration)

### Framework Choice: Fastify

**Why Fastify over Express?**
- ✅ Built-in JSON Schema validation (saves time)
- ✅ Built-in logging with Pino (production-ready)
- ✅ Better performance
- ✅ Modern async/await support
- ✅ Strong TypeScript support

### Data Persistence: In-Memory

**Chosen**: In-memory Map structure
- ✅ No external dependencies
- ✅ Fast for demonstration
- ✅ Easy to test
- ❌ Data lost on restart
- ❌ Not production-ready

**Production Alternative**: Would use PostgreSQL with Prisma or TypeORM

### Validation Strategy

**JSON Schema** at route level (Fastify built-in) + **Business validation** in service layer
- ✅ Automatic validation errors with good messages
- ✅ Double layer of protection
- ✅ Service layer can be used independently

### Error Handling

Custom error classes extending `AppError`:
- ✅ Type-safe error handling
- ✅ Consistent error responses
- ✅ Easy to extend

### Testing Strategy

- **Unit tests**: Repository and Service layers
- **Integration tests**: Full API endpoints
- ✅ Covers business logic and API behavior
- ✅ Easy to run with `npm test`

---

## Testing

Run tests with:

    npm test

Run with coverage:

    npm run test:coverage

---

## What Could Be Improved (Production Readiness)

### Completed ✅
- Full CRUD operations
- Filtering, search, and pagination
- Validation with clear error messages
- Logging
- Comprehensive tests
- Docker support
- Complete documentation

### TODO / Future Enhancements

#### Security
- [ ] API key authentication (bonus requirement)
- [ ] Rate limiting per IP (bonus requirement)
- [ ] CORS configuration for specific origins
- [ ] Helmet.js for security headers
- [ ] Input sanitization for XSS prevention

#### API Documentation
- [ ] OpenAPI/Swagger specification (bonus requirement)
- [ ] Swagger UI integration
- [ ] Postman collection

#### Persistence
- [ ] PostgreSQL/SQLite database
- [ ] Database migrations
- [ ] Connection pooling
- [ ] Data backup strategy

#### Observability
- [ ] Structured logging with correlation IDs
- [ ] Metrics (Prometheus)
- [ ] Distributed tracing (Jaeger/OpenTelemetry)
- [ ] Health checks for dependencies

#### Performance
- [ ] Response caching
- [ ] Database query optimization
- [ ] Compression middleware
- [ ] Load testing results

#### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment-specific configs
- [ ] Kubernetes manifests
- [ ] Monitoring alerts

---

## AI Tools Used

This project was developed with assistance from:
- **Claude Sonnet 4.5 (Anthropic)**: Code structure, best practices, and documentation
- **Gemini 2.5 Flash (Google)**: Commit messages auto-generation

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |

---

## License

MIT

---

## Author

Alexander Olmedo

---



**Built with ❤️ using Node.js, Fastify, and TypeScript**