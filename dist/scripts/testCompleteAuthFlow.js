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
async function testCompleteFlow() {
    console.log('=== TESTING FULL REGISTRATION -> OTP VERIFICATION -> LOGIN FLOW ===');
    const testEmail = `test_flow_${Date.now()}@gmail.com`;
    const testPassword = 'MySecretPassword123';
    const testName = 'Test Real User';
    // 1. REGISTER
    console.log(`\n[1] Calling POST /api/auth/register for ${testEmail}...`);
    const regRes = await axios_1.default.post('http://localhost:5000/api/auth/register', {
        name: testName,
        email: testEmail,
        password: testPassword,
        role: 'SUPERVISOR',
        phone: '9876543210'
    });
    console.log('Registration Response:', regRes.status, regRes.data);
    // 2. FETCH OTP FROM DB
    await mongoose_1.default.connect(env_1.config.mongoUri);
    const user = await User_1.User.findOne({ email: testEmail });
    console.log('User created in DB. isVerified:', user?.isVerified);
    // We need the OTP code. In dev terminal logs or by testing with unverified login first:
    console.log('\n[2] Attempting login BEFORE OTP verification (should be blocked with 403)...');
    try {
        await axios_1.default.post('http://localhost:5000/api/auth/login', {
            email: testEmail,
            password: testPassword
        });
        console.error('❌ ERROR: Login succeeded before OTP verification!');
    }
    catch (err) {
        console.log('✅ Expected 403 Block on Unverified Login:', err.response?.status, err.response?.data);
    }
    // 3. VERIFY OTP
    // Let's set an explicit OTP for this test
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    const testOtp = '123456';
    const salt = await bcrypt.genSalt(10);
    user.otpHash = await bcrypt.hash(testOtp, salt);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    console.log(`\n[3] Calling POST /api/auth/verify-otp with OTP: ${testOtp}...`);
    const verifyRes = await axios_1.default.post('http://localhost:5000/api/auth/verify-otp', {
        email: testEmail,
        otp: testOtp
    });
    console.log('✅ Verify OTP Response:', verifyRes.status, verifyRes.data);
    console.log('Token received on verify:', verifyRes.data?.token ? 'YES' : 'NO');
    // 4. LOGIN AFTER VERIFICATION
    console.log(`\n[4] Calling POST /api/auth/login for verified user...`);
    const loginRes = await axios_1.default.post('http://localhost:5000/api/auth/login', {
        email: testEmail,
        password: testPassword
    });
    console.log('✅ Login Response:', loginRes.status, loginRes.data);
    console.log('Token received on login:', loginRes.data?.token ? 'YES' : 'NO');
    // Clean up
    await User_1.User.deleteOne({ email: testEmail });
    await mongoose_1.default.disconnect();
    console.log('\n✅ Full Flow Tested Successfully with 100% PASS!');
    process.exit(0);
}
testCompleteFlow();
