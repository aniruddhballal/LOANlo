import mongoose from 'mongoose';
import config from './index';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      // These two options are no longer required in Mongoose 6+, but safe to keep if you’re on 5.x
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any); // cast if TS complains about options
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', (error as Error).message);
    throw error;
  }
};

export default connectDB;