import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function seed() {
  await mongoose.connect(config.mongoUri);
  const email = 'shivamdavande348@gmail.com';
  
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: 'Shivam Davande',
      email: email,
      password: 'Password123!',
      role: 'SUPERVISOR',
      isVerified: true,
      isActive: true
    });
    console.log(`✅ Created verified user for ${email} with password: Password123!`);
  } else {
    user.isVerified = true;
    user.isActive = true;
    user.password = 'Password123!';
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    console.log(`✅ Updated existing user for ${email} to isVerified: true with password: Password123!`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed();
