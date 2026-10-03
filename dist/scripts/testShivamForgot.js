"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testShivamForgot() {
    console.log('Testing forgot password for shivamdavande348@gmail.com...');
    try {
        const res = await axios_1.default.post('http://localhost:5000/api/auth/forgot-password', {
            email: 'shivamdavande348@gmail.com'
        });
        console.log('✅ Response:', res.status, res.data);
    }
    catch (err) {
        console.error('❌ Error:', err.response?.status, err.response?.data || err.message);
    }
}
testShivamForgot();
