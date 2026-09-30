import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import reviewRoutes from './routes/review.js';
import authRoutes from './routes/auth.js';
import { connectRedis } from './utils/cache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rate limiting: 10 reviews per IP per hour
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many reviews. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/review', reviewLimiter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to Redis (non-fatal if unavailable)
connectRedis();

app.use('/api', reviewRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
