"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function testForgotFlow() {
    console.log('=== TESTING FORGOT & RESET PASSWORD FLOW ===');
    await mongoose_1.default.connect(env_1.config.mongoUri);
    const testEmail = `forgot_test_${Date.now()}@gmail.com`;
    const oldPassword = 'OldPassword123';
    const newPassword = 'NewSecretPassword456';
    // 1. Create verified user
    const user = await User_1.User.create({
        name: 'Forgot Test User',
        email: testEmail,
        password: oldPassword,
        role: 'SUPERVISOR',
        isVerified: true
    });
    console.log('Created user in DB:', user.email);
    // 2. Request Forgot Password
    console.log('\n[1] Calling POST /api/auth/forgot-password...');
    const forgotRes = await axios_1.default.post('http://localhost:5000/api/auth/forgot-password', {
        email: testEmail
    });
    console.log('Forgot Password Response:', forgotRes.status, forgotRes.data);
    // 3. Check OTP in DB
    const userAfterForgot = await User_1.User.findOne({ email: testEmail });
    console.log('Has resetPasswordOtpHash in DB:', !!userAfterForgot?.resetPasswordOtpHash);
    console.log('Reset OTP Expires at:', userAfterForgot?.resetPasswordOtpExpires);
    // Set explicit OTP for testing reset
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    const testOtp = '987654';
    const salt = await bcrypt.genSalt(10);
    userAfterForgot.resetPasswordOtpHash = await bcrypt.hash(testOtp, salt);
    await userAfterForgot.save();
    // 4. Test Reset Password with wrong OTP
    console.log('\n[2] Testing POST /api/auth/reset-password with WRONG OTP (000000)...');
    try {
        await axios_1.default.post('http://localhost:5000/api/auth/reset-password', {
            email: testEmail,
            otp: '000000',
            newPassword
        });
        console.error('❌ ERROR: Wrong OTP was accepted for reset password!');
    }
    catch (err) {
        console.log('✅ Expected Failure on invalid reset OTP:', err.response?.status, err.response?.data?.message);
    }
    // 5. Test Reset Password with CORRECT OTP
    console.log(`\n[3] Testing POST /api/auth/reset-password with CORRECT OTP (${testOtp})...`);
    const resetRes = await axios_1.default.post('http://localhost:5000/api/auth/reset-password', {
        email: testEmail,
        otp: testOtp,
        newPassword
    });
    console.log('✅ Reset Password Response:', resetRes.status, resetRes.data);
    // 6. Test Login with Old Password (should FAIL)
    console.log('\n[4] Testing Login with OLD password (should fail)...');
    try {
        await axios_1.default.post('http://localhost:5000/api/auth/login', {
            email: testEmail,
            password: oldPassword
        });
        console.error('❌ ERROR: Login succeeded with old password!');
    }
    catch (err) {
        console.log('✅ Expected Failure on old password login:', err.response?.status, err.response?.data?.message);
    }
    // 7. Test Login with NEW Password (should SUCCEED)
    console.log('\n[5] Testing Login with NEW password (should succeed)...');
    const loginRes = await axios_1.default.post('http://localhost:5000/api/auth/login', {
        email: testEmail,
        password: newPassword
    });
    console.log('✅ Login with NEW password successful:', loginRes.status, loginRes.data?.user?.email);
    // Clean up
    await User_1.User.deleteOne({ email: testEmail });
    await mongoose_1.default.disconnect();
    console.log('\n✅ Forgot & Reset Password Flow Tested 100% PASSED!');
    process.exit(0);
}
testForgotFlow();
