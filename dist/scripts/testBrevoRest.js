"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
async function testRestApi() {
    const apiKey = process.env.BREVO_API_KEY?.trim() || '';
    const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || '';
    const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'R&D CONSTRUCTIONS';
    console.log('Testing Brevo REST API v3 with key:', apiKey.substring(0, 15) + '...');
    try {
        const payload = {
            sender: { name: senderName, email: senderEmail },
            to: [{ email: senderEmail, name: 'Test User' }],
            subject: 'Test Email via Brevo REST API',
            htmlContent: '<h3>Brevo REST API Test Success!</h3>'
        };
        const res = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'accept': 'application/json',
                'content-type': 'application/json'
            }
        });
        console.log('REST API Success Response:', res.data);
    }
    catch (err) {
        console.error('REST API Error Status:', err.response?.status);
        console.error('REST API Error Data:', err.response?.data || err.message);
    }
}
testRestApi();
