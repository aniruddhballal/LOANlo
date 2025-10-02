import express, { Application } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import config from './config';
import connectDB from './config/database';

// Routes
import authRoutes from './routes/auth';
import loanRoutes from './routes/loans';
import documentRoutes from './routes/documents';
import profileRoutes from './routes/profile';

const app: Application = express();
const PORT: number = Number(config.PORT) || 5000;

// Middleware
app.use(cors({
  origin: "https://loanlo.vercel.app",
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use('/api/profile', profileRoutes); // mount under /api/profile

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/documents', documentRoutes);

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
