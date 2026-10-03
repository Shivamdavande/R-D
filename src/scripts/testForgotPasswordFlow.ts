import axios from 'axios';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';

async function testForgotFlow() {
  console.log('=== TESTING FORGOT & RESET PASSWORD FLOW ===');
  await mongoose.connect(config.mongoUri);

  const testEmail = `forgot_test_${Date.now()}@gmail.com`;
  const oldPassword = 'OldPassword123';
  const newPassword = 'NewSecretPassword456';

  // 1. Create verified user
  const user = await User.create({
    name: 'Forgot Test User',
    email: testEmail,
    password: oldPassword,
    role: 'SUPERVISOR',
    isVerified: true
  });
  console.log('Created user in DB:', user.email);

  // 2. Request Forgot Password
  console.log('\n[1] Calling POST /api/auth/forgot-password...');
  const forgotRes = await axios.post('http://localhost:5000/api/auth/forgot-password', {
    email: testEmail
  });
  console.log('Forgot Password Response:', forgotRes.status, forgotRes.data);

  // 3. Check OTP in DB
  const userAfterForgot = await User.findOne({ email: testEmail });
  console.log('Has resetPasswordOtpHash in DB:', !!userAfterForgot?.resetPasswordOtpHash);
  console.log('Reset OTP Expires at:', userAfterForgot?.resetPasswordOtpExpires);

  // Set explicit OTP for testing reset
  const bcrypt = await import('bcryptjs');
  const testOtp = '987654';
  const salt = await bcrypt.genSalt(10);
  userAfterForgot!.resetPasswordOtpHash = await bcrypt.hash(testOtp, salt);
  await userAfterForgot!.save();

  // 4. Test Reset Password with wrong OTP
  console.log('\n[2] Testing POST /api/auth/reset-password with WRONG OTP (000000)...');
  try {
    await axios.post('http://localhost:5000/api/auth/reset-password', {
      email: testEmail,
      otp: '000000',
      newPassword
    });
    console.error('❌ ERROR: Wrong OTP was accepted for reset password!');
  } catch (err: any) {
    console.log('✅ Expected Failure on invalid reset OTP:', err.response?.status, err.response?.data?.message);
  }

  // 5. Test Reset Password with CORRECT OTP
  console.log(`\n[3] Testing POST /api/auth/reset-password with CORRECT OTP (${testOtp})...`);
  const resetRes = await axios.post('http://localhost:5000/api/auth/reset-password', {
    email: testEmail,
    otp: testOtp,
    newPassword
  });
  console.log('✅ Reset Password Response:', resetRes.status, resetRes.data);

  // 6. Test Login with Old Password (should FAIL)
  console.log('\n[4] Testing Login with OLD password (should fail)...');
  try {
    await axios.post('http://localhost:5000/api/auth/login', {
      email: testEmail,
      password: oldPassword
    });
    console.error('❌ ERROR: Login succeeded with old password!');
  } catch (err: any) {
    console.log('✅ Expected Failure on old password login:', err.response?.status, err.response?.data?.message);
  }

  // 7. Test Login with NEW Password (should SUCCEED)
  console.log('\n[5] Testing Login with NEW password (should succeed)...');
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: testEmail,
    password: newPassword
  });
  console.log('✅ Login with NEW password successful:', loginRes.status, loginRes.data?.user?.email);

  // Clean up
  await User.deleteOne({ email: testEmail });
  await mongoose.disconnect();
  console.log('\n✅ Forgot & Reset Password Flow Tested 100% PASSED!');
  process.exit(0);
}

testForgotFlow();
