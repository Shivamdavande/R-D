import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    // Don't terminate process if in mock/test fallback mode
  }
};
