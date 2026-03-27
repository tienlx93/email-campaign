import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const paths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'name', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string' },
                password: { type: 'string', minLength: 8 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'User created successfully' },
        400: { description: 'Validation failed' },
        409: { description: 'Email already in use' },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Login successful' },
        400: { description: 'Validation failed' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
  '/campaigns': {
    get: {
      tags: ['Campaigns'],
      summary: 'List campaigns (paginated)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
      ],
      responses: {
        200: { description: 'Paginated list of campaigns' },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Campaigns'],
      summary: 'Create a new campaign',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'subject', 'body'],
              properties: {
                name: { type: 'string' },
                subject: { type: 'string' },
                body: { type: 'string' },
                recipients: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['email', 'name'],
                    properties: {
                      email: { type: 'string', format: 'email' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Campaign created' },
        400: { description: 'Validation failed' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/campaigns/{id}': {
    get: {
      tags: ['Campaigns'],
      summary: 'Get a single campaign',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Campaign details' },
        401: { description: 'Unauthorized' },
        404: { description: 'Campaign not found' },
      },
    },
    patch: {
      tags: ['Campaigns'],
      summary: 'Update a draft campaign',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                subject: { type: 'string' },
                body: { type: 'string' },
                recipients: { type: 'array' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Campaign updated' },
        400: { description: 'Validation failed' },
        401: { description: 'Unauthorized' },
        404: { description: 'Campaign not found' },
        409: { description: 'Campaign is not in draft status' },
      },
    },
    delete: {
      tags: ['Campaigns'],
      summary: 'Delete a draft campaign',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        204: { description: 'Campaign deleted' },
        401: { description: 'Unauthorized' },
        404: { description: 'Campaign not found' },
        409: { description: 'Campaign is not in draft status' },
      },
    },
  },
  '/campaigns/{id}/schedule': {
    post: {
      tags: ['Campaigns'],
      summary: 'Schedule or cancel a campaign send',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['scheduled_at'],
              properties: {
                scheduled_at: { type: 'string', format: 'date-time', nullable: true },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Campaign scheduled or unscheduled' },
        400: { description: 'Validation failed' },
        401: { description: 'Unauthorized' },
        404: { description: 'Campaign not found' },
        409: { description: 'Campaign already sent' },
      },
    },
  },
  '/campaigns/{id}/send': {
    post: {
      tags: ['Campaigns'],
      summary: 'Send a campaign immediately',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Campaign sent' },
        401: { description: 'Unauthorized' },
        404: { description: 'Campaign not found' },
        409: { description: 'Campaign already sent' },
      },
    },
  },
  '/campaigns/{id}/stats': {
    get: {
      tags: ['Campaigns'],
      summary: 'Get send and open stats for a campaign',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Campaign stats' },
        401: { description: 'Unauthorized' },
        404: { description: 'Campaign not found' },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Campaign Manager API',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths,
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUi = swaggerUiExpress;
