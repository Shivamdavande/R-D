import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function testLogin() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB');

    const users = await User.find();
    console.log('\nTesting login status for all users in DB:');
    
    for (const u of users) {
      console.log(`User: ${u.name} (${u.email}) | Role: ${u.role} | Verified: ${u.isVerified} | Active: ${u.isActive}`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLogin();
