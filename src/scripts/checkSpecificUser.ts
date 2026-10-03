import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function checkUser() {
  await mongoose.connect(config.mongoUri);
  const users = await User.find({ email: 'shivamdavande348@gmail.com' });
  console.log('Users found for shivamdavande348@gmail.com:', users.length);
  users.forEach(u => {
    console.log({
      id: u._id,
      name: u.name,
      email: u.email,
      isVerified: u.isVerified,
      hasOtpHash: !!u.otpHash,
      otpExpiresAt: u.otpExpiresAt
    });
  });
  await mongoose.disconnect();
  process.exit(0);
}

checkUser();
