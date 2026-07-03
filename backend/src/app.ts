import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Configure CORS allowed origins for host, Vite dev port, and Nginx container ports
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1'
  ],
  credentials: true, // Enables cookie storage/exchange across origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsers & logging
app.use(express.json({ limit: '10kb' })); // Prevents massive payload DOS attacks
app.use(cookieParser());
app.use(morgan('dev'));

// General Rate Limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again in 15 minutes.'
  }
});

// Strict Rate Limiter - 5 authentication attempts per 15 minutes (Login/Register protection)
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  }
});

// Apply rate limiting rules to matching endpoint prefixes
app.use('/api/v1/auth/login', strictAuthLimiter);
app.use('/api/v1/auth/register', strictAuthLimiter);
app.use('/api/v1', generalLimiter);

// Swagger documentation setup
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AccessGuard API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API with JWT Authentication and Role-Based Access Control (RBAC). Supported entities: Tasks.',
      contact: {
        name: 'Developer support',
        email: 'internship@accessguard.com'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Default API Gateway (Relative)',
      },
      {
        url: 'http://localhost:5050/api/v1',
        description: 'Direct API Server (Host Access)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Pass JWT as Bearer in Authorization header'
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Automatic cookie auth when logged in'
        }
      }
    }
  },
  // Point to route definitions for JSDoc documentation parsing
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './dist/routes/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  logger.info('System health-check ping received');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register routes prefixed with /api/v1/
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Catch-all route for unhandled paths
app.use((req, res, next) => {
  const error: any = new Error(`Route not found: [${req.method}] ${req.path}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handler
app.use(errorHandler);

export default app;
