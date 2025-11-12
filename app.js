import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import routes from './routes/index.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://go-ride-server-side.vercel.app',
    'https://goride-by-fahim.netlify.app', 
    'https://*.netlify.app' 
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

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
    },
    cors: {
      allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://go-ride-server-side.vercel.app',
        'https://goride-by-fahim.netlify.app',
        'https://*.netlify.app'
      ]
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🚗 GoRide API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: '/api',
    health: '/health',
    version: '1.0.0'
  });
});

app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use(notFound);
app.use(errorHandler);

export default app;