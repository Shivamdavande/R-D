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
async function testSupervisorSites() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('\n=== TESTING SITES FETCHED FOR EACH USER ===\n');
        const allUsers = await User_1.User.find();
        for (const user of allUsers) {
            console.log(`\n-------------------------------------------------`);
            console.log(`User: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
            let sites;
            if (user.role === 'OWNER') {
                sites = await Site_1.Site.find().sort({ createdAt: -1 });
            }
            else {
                const memberships = await SiteMember_1.SiteMember.find({ userId: user._id });
                const siteIds = memberships.map(m => m.siteId);
                sites = await Site_1.Site.find({ _id: { $in: siteIds } }).sort({ createdAt: -1 });
            }
            console.log(`Visible Sites Count: ${sites.length}`);
            sites.forEach((s, idx) => {
                console.log(`  ${idx + 1}. [${s.status}] ${s.siteName} (ID: ${s._id})`);
            });
        }
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        console.error(err);
    }
}
testSupervisorSites();
