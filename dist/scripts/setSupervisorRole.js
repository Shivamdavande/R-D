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
async function setupSupervisor() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        // Check user shivamdavande348@gmail.com
        const user = await User_1.User.findOne({ email: 'shivamdavande348@gmail.com' });
        if (user) {
            user.role = 'SUPERVISOR';
            await user.save();
            console.log(`Updated ${user.email} role to: SUPERVISOR`);
            // Add to one site so they see exactly that site
            const site = await Site_1.Site.findOne({ siteName: 'MPSO BUILDING' });
            const owner = await User_1.User.findOne({ role: 'OWNER' });
            if (site && owner) {
                const existing = await SiteMember_1.SiteMember.findOne({ siteId: site._id, userId: user._id });
                if (!existing) {
                    await SiteMember_1.SiteMember.create({
                        siteId: site._id,
                        userId: user._id,
                        role: 'SUPERVISOR',
                        assignedBy: owner._id
                    });
                    console.log(`Assigned ${user.email} to site: ${site.siteName}`);
                }
            }
        }
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        console.error(err);
    }
}
setupSupervisor();
