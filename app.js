import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment.js';
import { CORS_OPTIONS, RATE_LIMIT } from './utils/constants.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(rateLimit(RATE_LIMIT));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;