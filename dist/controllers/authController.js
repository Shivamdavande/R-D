"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, env_1.config.jwtSecret, {
        expiresIn: env_1.config.jwtExpiresIn
    });
};
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, companyName } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase().trim(),
            password,
            phone,
            role: role || 'SUPERVISOR',
            companyName: companyName || env_1.config.companyName
        });
        const token = generateToken(user._id.toString());
        return res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                companyName: user.companyName
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated.' });
        }
        const token = generateToken(user._id.toString());
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                companyName: user.companyName
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Login failed.' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authenticated.' });
        }
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                companyName: user.companyName
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
