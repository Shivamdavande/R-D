import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

const startServer = async () => {
  await connectDB();
  
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(` 🚀 R2R Contractor Backend API Server Running`);
    console.log(` 📍 PORT: ${config.port}`);
    console.log(` 🌐 ENV: ${config.nodeEnv}`);
    console.log(` 🏷️  COMPANY: ${config.companyName}`);
    console.log(`=======================================================`);
  });
};

startServer();
