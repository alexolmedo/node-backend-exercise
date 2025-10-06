export const taskSchema = {
  type: 'object',
  properties: {
    id: {type: 'string', format: 'uuid'},
    title: {type: 'string'},
    status: {type: 'string', enum: ['todo', 'in_progress', 'done']},
    dueDate: {type: 'string', format: 'date-time', nullable: true},
    createdAt: {type: 'string', format: 'date-time'},
    updatedAt: {type: 'string', format: 'date-time'}
  },
  required: ['id', 'title', 'status', 'createdAt', 'updatedAt']
} as const;

export const createTaskSchema = {
  body: {
    type: 'object',
    properties: {
      title: {type: 'string', minLength: 1, maxLength: 200},
      status: {type: 'string', enum: ['todo', 'in_progress', 'done']},
      dueDate: {type: 'string', format: 'date-time'}
    },
    required: ['title']
  },
  response: {
    201: taskSchema
  }
} as const;

export const updateTaskSchema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'string'}
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      title: {type: 'string', minLength: 1, maxLength: 200},
      status: {type: 'string', enum: ['todo', 'in_progress', 'done']},
      dueDate: {type: 'string', format: 'date-time', nullable: true}
    },
    minProperties: 1 // At least one field must be provided
  },
  response: {
    200: taskSchema
  }
} as const;

export const getTaskSchema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'string'}
    },
    required: ['id']
  },
  response: {
    200: taskSchema
  }
} as const;

export const deleteTaskSchema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'string'}
    },
    required: ['id']
  },
  response: {
    204: {
      type: 'null',
      description: 'No content'
    }
  }
} as const;

export const listTasksSchema = {
  querystring: {
    type: 'object',
    properties: {
      status: {type: 'string', enum: ['todo', 'in_progress', 'done']},
      q: {type: 'string'},
      page: {type: 'integer', minimum: 1, default: 1},
      pageSize: {type: 'integer', minimum: 1, maximum: 100, default: 10}
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: taskSchema
        },
        pagination: {
          type: 'object',
          properties: {
            page: {type: 'integer'},
            pageSize: {type: 'integer'},
            total: {type: 'integer'},
            totalPages: {type: 'integer'}
          }
        }
      }
    }
  }
} as const;

export const statsSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        total: {type: 'integer'},
        byStatus: {
          type: 'object',
          properties: {
            todo: {type: 'integer'},
            in_progress: {type: 'integer'},
            done: {type: 'integer'}
          }
        },
        overdue: {type: 'integer'}
      }
    }
  }
} as const;