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

```bash
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