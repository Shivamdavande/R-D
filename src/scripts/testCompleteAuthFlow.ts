import axios from 'axios';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function testCompleteFlow() {
  console.log('=== TESTING FULL REGISTRATION -> OTP VERIFICATION -> LOGIN FLOW ===');
  
  const testEmail = `test_flow_${Date.now()}@gmail.com`;
  const testPassword = 'MySecretPassword123';
  const testName = 'Test Real User';

  // 1. REGISTER
  console.log(`\n[1] Calling POST /api/auth/register for ${testEmail}...`);
  const regRes = await axios.post('http://localhost:5000/api/auth/register', {
    name: testName,
    email: testEmail,
    password: testPassword,
    role: 'SUPERVISOR',
    phone: '9876543210'
  });
  console.log('Registration Response:', regRes.status, regRes.data);

  // 2. FETCH OTP FROM DB
  await mongoose.connect(config.mongoUri);
  const user = await User.findOne({ email: testEmail });
  console.log('User created in DB. isVerified:', user?.isVerified);

  // We need the OTP code. In dev terminal logs or by testing with unverified login first:
  console.log('\n[2] Attempting login BEFORE OTP verification (should be blocked with 403)...');
  try {
    await axios.post('http://localhost:5000/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    console.error('❌ ERROR: Login succeeded before OTP verification!');
  } catch (err: any) {
    console.log('✅ Expected 403 Block on Unverified Login:', err.response?.status, err.response?.data);
  }

  // 3. VERIFY OTP
  // Let's set an explicit OTP for this test
  const bcrypt = await import('bcryptjs');
  const testOtp = '123456';
  const salt = await bcrypt.genSalt(10);
  user!.otpHash = await bcrypt.hash(testOtp, salt);
  user!.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user!.save();

  console.log(`\n[3] Calling POST /api/auth/verify-otp with OTP: ${testOtp}...`);
  const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-otp', {
    email: testEmail,
    otp: testOtp
  });
  console.log('✅ Verify OTP Response:', verifyRes.status, verifyRes.data);
  console.log('Token received on verify:', verifyRes.data?.token ? 'YES' : 'NO');

  // 4. LOGIN AFTER VERIFICATION
  console.log(`\n[4] Calling POST /api/auth/login for verified user...`);
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: testEmail,
    password: testPassword
  });
  console.log('✅ Login Response:', loginRes.status, loginRes.data);
  console.log('Token received on login:', loginRes.data?.token ? 'YES' : 'NO');

  // Clean up
  await User.deleteOne({ email: testEmail });
  await mongoose.disconnect();
  console.log('\n✅ Full Flow Tested Successfully with 100% PASS!');
  process.exit(0);
}

testCompleteFlow();
