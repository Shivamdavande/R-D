"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Site_1 = require("../models/Site");
const SiteMember_1 = require("../models/SiteMember");
const env_1 = require("../config/env");
async function checkUsersAndSites() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('MongoDB Connected.\n');
        const users = await User_1.User.find({}, 'name email role isVerified');
        console.log('--- ALL USERS IN DB ---');
        console.table(users.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, role: u.role, isVerified: u.isVerified })));
        const sites = await Site_1.Site.find({}, 'siteName clientName status createdBy');
        console.log('\n--- ALL SITES IN DB ---');
        console.table(sites.map(s => ({ id: s._id.toString(), siteName: s.siteName, clientName: s.clientName, status: s.status, createdBy: s.createdBy?.toString() })));
        const members = await SiteMember_1.SiteMember.find().populate('siteId', 'siteName').populate('userId', 'name email role');
        console.log('\n--- ALL SITE MEMBERS IN DB ---');
        console.table(members.map(m => ({
            site: m.siteId?.siteName || m.siteId,
            user: m.userId?.name || m.userId,
            userEmail: m.userId?.email,
            role: m.role
        })));
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        console.error(err);
    }
}
checkUsersAndSites();
