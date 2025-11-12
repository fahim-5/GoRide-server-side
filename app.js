import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import routes
import routes from './routes/index.js';

const app = express();

// Enhanced CORS configuration for ALL your frontend domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://go-ride-server-side.vercel.app',
    'https://goride-by-fahim.netlify.app', // YOUR NETLIFY DOMAIN
    'https://*.netlify.app' // All Netlify subdomains
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
}));

// Body parsing middleware
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

// Root route
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

// Test CORS route
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Error Handlers
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use(notFound);
app.use(errorHandler);

export default app;