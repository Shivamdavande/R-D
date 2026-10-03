import mongoose from 'mongoose';
import { cleanupExpiredClosedSiteImages } from '../services/imageCleanupService';
import { config } from '../config/env';

async function testCleanup() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected.');

    console.log('Running cleanupExpiredClosedSiteImages test...');
    await cleanupExpiredClosedSiteImages();
    console.log('Cleanup completed successfully.');

    await mongoose.disconnect();
  } catch (e) {
    console.error('Test error:', e);
  }
}

testCleanup();
