import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import routes
import routes from './routes/index.js';

const app = express();

// Enhanced CORS configuration for your frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://go-ride-server-side.vercel.app',
    // Add your frontend domains here when deployed
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Primary API Route Handler
app.use('/api', routes);

// Enhanced Health Check Route
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? 'healthy' : 'unhealthy';
  const statusCode = dbState === 1 ? 200 : 503;
  
  res.status(statusCode).json({
    status: status,
    database: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbState === 1 ? 'operational' : 'down',
      firebase: 'operational'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚗 GoRide API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: '/api',
    health: '/health'
  });
});

// Error Handlers
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use(notFound);
app.use(errorHandler);

export default app;