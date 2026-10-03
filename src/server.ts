import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { startImageCleanupCron } from './services/imageCleanupService';

const startServer = async () => {
  await connectDB();
  
  // Start 14-day closed site image auto-cleanup background service
  startImageCleanupCron();
  
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(` 🚀 R&D Contractor Backend API Server Running`);
    console.log(` 📍 PORT: ${config.port}`);
    console.log(` 🌐 ENV: ${config.nodeEnv}`);
    console.log(` 🏷️  COMPANY: ${config.companyName}`);
    console.log(`=======================================================`);
  });
};

startServer();
