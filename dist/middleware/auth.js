"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.query && req.query.token) {
            token = req.query.token;
        }
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'User account has been deactivated.' });
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
exports.authenticate = authenticate;
