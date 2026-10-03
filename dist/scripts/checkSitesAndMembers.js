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
async function checkSites() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('Connected to DB');
        const sites = await Site_1.Site.find();
        console.log(`\nFound ${sites.length} Sites:`);
        sites.forEach(s => {
            console.log(`- Site ID: ${s._id} | Name: ${s.siteName} | Client: ${s.clientName} | Status: ${s.status} | CreatedBy: ${s.createdBy}`);
        });
        const members = await SiteMember_1.SiteMember.find();
        console.log(`\nFound ${members.length} SiteMembers:`);
        members.forEach(m => {
            console.log(`- Member ID: ${m._id} | SiteId: ${m.siteId} | UserId: ${m.userId} | Role: ${m.role}`);
        });
        const users = await User_1.User.find();
        console.log(`\nFound ${users.length} Users:`);
        users.forEach(u => {
            console.log(`- User ID: ${u._id} | Name: ${u.name} | Role: ${u.role}`);
        });
    }
    catch (err) {
        console.error('Error checking sites:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
checkSites();
