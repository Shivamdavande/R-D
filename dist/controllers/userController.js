"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.User.find().select('-password').sort({ name: 1 });
        return res.status(200).json({ success: true, count: users.length, users });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch users.' });
    }
};
exports.getAllUsers = getAllUsers;
