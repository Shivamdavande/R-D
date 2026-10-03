"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function resetUser() {
    await mongoose_1.default.connect(env_1.config.mongoUri);
    const del = await User_1.User.deleteMany({ email: 'shivamdavande348@gmail.com' });
    console.log(`Deleted ${del.deletedCount} unverified test user records for shivamdavande348@gmail.com`);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
resetUser();
