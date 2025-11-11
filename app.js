import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js'; // Assuming this file exists
import { CORS_OPTIONS, RATE_LIMIT } from './utils/constants.js'; // Assuming this file exists
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js'; // Assuming these files exist

const app = express();

// Security and Utility Middleware
app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(rateLimit(RATE_LIMIT));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Primary API Route Handler
app.use('/api', routes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv // Assuming config.nodeEnv is available
  });
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;