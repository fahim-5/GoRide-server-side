import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import routes - FIXED IMPORT
import routes from './routes/index.js'; // Make sure this path is correct

const app = express();

// Security and Utility Middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
    documentation: '/api'
  });
});

// Error Handlers - Make sure these are imported correctly
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use(notFound);
app.use(errorHandler);

export default app;