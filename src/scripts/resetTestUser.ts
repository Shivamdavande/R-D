import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function resetUser() {
  await mongoose.connect(config.mongoUri);
  const del = await User.deleteMany({ email: 'shivamdavande348@gmail.com' });
  console.log(`Deleted ${del.deletedCount} unverified test user records for shivamdavande348@gmail.com`);
  await mongoose.disconnect();
  process.exit(0);
}

resetUser();
