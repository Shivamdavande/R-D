import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function checkUsers() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB');

    const users = await User.find();
    console.log(`Found ${users.length} users:`);
    
    users.forEach(u => {
      console.log({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        isVerified: u.isVerified,
        hasOtpHash: !!u.otpHash,
        otpExpiresAt: u.otpExpiresAt
      });
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
