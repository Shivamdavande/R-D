"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/r_and_d_constructions_db',
    jwtSecret: process.env.JWT_SECRET || 'rd_constructions_super_secret_jwt_key_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
    nodeEnv: process.env.NODE_ENV || 'development',
    companyName: process.env.COMPANY_NAME || 'R&D CONSTRUCTIONS',
    imageKit: {
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    brevo: {
        apiKey: process.env.BREVO_API_KEY || '',
        senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@randdconstructions.com',
        senderName: process.env.BREVO_SENDER_NAME || process.env.COMPANY_NAME || 'R&D CONSTRUCTIONS'
    }
};
