import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hybrid ATS API',
      version: '1.0.0',
      description: 'AI-powered Applicant Tracking System with automated resume screening',
      contact: {
        name: 'API Support',
        email: 'admin@hybridats.com'
      },
    },
    servers: [
      {
        url: 'https://hyresync.onrender.com/api',
        description: 'Production server',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
