import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';
import { EmailLog } from '../models/EmailLog';

async function checkStatus() {
  await mongoose.connect(config.mongoUri);
  const users = await User.find({ email: 'shivamdavande348@gmail.com' });
  console.log('=== USER DB STATUS ===');
  console.log('Users found:', users.length);
  users.forEach(u => {
    console.log({
      id: u._id,
      name: u.name,
      email: u.email,
      isVerified: u.isVerified,
      otpAttempts: u.otpAttempts,
      otpExpiresAt: u.otpExpiresAt,
      hasOtpHash: !!u.otpHash
    });
  });

  const logs = await EmailLog.find({ recipient: 'shivamdavande348@gmail.com' }).sort({ createdAt: -1 }).limit(5);
  console.log('\n=== RECENT EMAIL LOGS ===');
  logs.forEach(l => {
    console.log({
      type: l.emailType,
      status: l.status,
      failureReason: l.failureReason,
      createdAt: l.createdAt
    });
  });

  await mongoose.disconnect();
  process.exit(0);
}

checkStatus();
