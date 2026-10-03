"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function testLogin() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('Connected to DB');
        const users = await User_1.User.find();
        console.log('\nTesting login status for all users in DB:');
        for (const u of users) {
            console.log(`User: ${u.name} (${u.email}) | Role: ${u.role} | Verified: ${u.isVerified} | Active: ${u.isActive}`);
        }
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
testLogin();
