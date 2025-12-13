import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import errorHandler from './middleware/errorHandler';
import { checkDbConnection } from './utils/dbHealthCheck'; // Import the new health check utility

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow only your frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allow all common methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isDbConnected = await checkDbConnection();
  if (isDbConnected) {
    res.status(200).json({ status: 'ok', database: 'connected' });
  } else {
    res.status(503).json({ status: 'error', database: 'disconnected', message: 'Database connection failed' });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;