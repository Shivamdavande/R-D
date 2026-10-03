"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function testFlow() {
    console.log('=== TESTING REGISTRATION & OTP VERIFICATION HTTP ENDPOINTS ===');
    const dummyEmail = `dummy_test_${Date.now()}@gmail.com`;
    const dummyName = 'Dummy Tester';
    const dummyPassword = 'Password123!';
    console.log(`\n[1] Sending POST /api/auth/register for email: ${dummyEmail}...`);
    try {
        const regRes = await axios_1.default.post('http://localhost:5000/api/auth/register', {
            name: dummyName,
            email: dummyEmail,
            password: dummyPassword,
            role: 'SUPERVISOR',
            phone: '9876543210'
        });
        console.log('✅ Registration Response Status:', regRes.status);
        console.log('✅ Registration Response Data:', regRes.data);
        if (regRes.data?.token) {
            console.error('❌ ERROR: Token returned on registration before OTP verification! (Bypassed OTP)');
        }
        else if (regRes.data?.requiresOtp) {
            console.log('✅ SUCCESS: requiresOtp is true and NO token returned! OTP is strictly required.');
        }
        // Connect to DB to get the generated OTP for testing verify-otp
        await mongoose_1.default.connect(env_1.config.mongoUri);
        const userInDb = await User_1.User.findOne({ email: dummyEmail });
        console.log('\n[2] Checking DB record for unverified user...');
        console.log('User in DB:', userInDb?.email, '| isVerified:', userInDb?.isVerified);
        if (userInDb && !userInDb.isVerified) {
            console.log('✅ User is safely unverified in database.');
        }
        // Now test verifying with wrong OTP
        console.log('\n[3] Testing POST /api/auth/verify-otp with INVALID OTP (000000)...');
        try {
            await axios_1.default.post('http://localhost:5000/api/auth/verify-otp', {
                email: dummyEmail,
                otp: '000000'
            });
            console.error('❌ ERROR: Invalid OTP was accepted!');
        }
        catch (err) {
            console.log('✅ Expected Failure on invalid OTP:', err.response?.status, err.response?.data?.message);
        }
        // Clean up dummy test user
        await User_1.User.deleteOne({ email: dummyEmail });
        console.log('\n✅ Test completed cleanly!');
    }
    catch (err) {
        console.error('❌ HTTP Request Error:', err.response?.status, err.response?.data || err.message);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
testFlow();
