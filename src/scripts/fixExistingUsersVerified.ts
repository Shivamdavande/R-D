import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function fixUsers() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB');

    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true }, $unset: { otpHash: "", otpExpiresAt: "", otpResendCooldownAt: "", otpAttempts: "" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to isVerified: true`);

    const users = await User.find();
    console.log('\nCurrent All Users in DB:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) | Role: ${u.role} | Verified: ${u.isVerified}`);
    });
  } catch (err) {
    console.error('Error fixing users:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixUsers();
