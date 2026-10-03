"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function checkUser() {
    await mongoose_1.default.connect(env_1.config.mongoUri);
    const users = await User_1.User.find({ email: 'shivamdavande348@gmail.com' });
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
    await mongoose_1.default.disconnect();
    process.exit(0);
}
checkUser();
