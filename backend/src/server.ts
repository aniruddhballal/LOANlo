import express, { Application } from 'express';
import cors from 'cors';
import fs from 'fs';
import config from './config';
import connectDB from './config/database';

// Routes
import authRoutes from './routes/auth';
import loanRoutes from './routes/loans';
import documentRoutes from './routes/documents';
import profileRoutes from './routes/profile';
import profileHistoryRoutes from './routes/profileHistory';

import ipWhitelistRoutes from './routes/ipWhitelist';
import { checkIpWhitelist } from './middleware/ipWhitelist';

const app: Application = express();

// Trust Render / Vercel proxy headers
app.set('trust proxy', 1);

const PORT: number = Number(config.PORT) || 5000;

// Allowed origins from .env (comma-separated)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // ensure OPTIONS requests always succeed

app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/profile', profileRoutes); // mount under /api/profile
app.use('/api/profile-history', profileHistoryRoutes);

// Add IP whitelist routes
app.use('/api/ip-whitelist', ipWhitelistRoutes);

// Add IP whitelist check middleware AFTER authenticateToken is applied globally
// OR apply it per-route basis in your routes
// Option 1: Global (after auth routes but before protected routes)
app.use('/api', checkIpWhitelist); // This will check all /api/* routes

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error('❌ MongoDB connection error:', err.message);
    } else {
      console.error('❌ MongoDB connection error:', err);
    }
  });
