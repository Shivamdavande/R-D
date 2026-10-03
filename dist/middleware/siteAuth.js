"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSiteOwner = exports.requireActiveSite = exports.requireSiteAccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Site_1 = require("../models/Site");
const SiteMember_1 = require("../models/SiteMember");
/**
 * Ensures user has access to the site (either Owner global role, Site Creator, or assigned Site Member).
 */
const requireSiteAccess = async (req, res, next) => {
    try {
        const siteId = req.params.id || req.params.siteId || req.body.siteId;
        if (!siteId || siteId === 'undefined' || siteId === 'null') {
            return res.status(400).json({ success: false, message: 'Valid Site ID is required.' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({ success: false, message: 'Invalid Site ID format.' });
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const site = await Site_1.Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found.' });
        }
        // Owner role has global access to all sites
        if (user.role === 'OWNER') {
            req.siteRole = 'OWNER';
            return next();
        }
        // Check membership: Non-owners only have access if assigned by Owner in SiteMember
        const membership = await SiteMember_1.SiteMember.findOne({ siteId: site._id, userId: user._id });
        if (!membership) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You are not assigned to this site by the Owner.'
            });
        }
        req.siteRole = membership.role;
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Error checking site authorization.' });
    }
};
exports.requireSiteAccess = requireSiteAccess;
/**
 * Ensures site is ACTIVE when writing/modifying data. If CLOSED, only OWNER can edit.
 */
const requireActiveSite = async (req, res, next) => {
    try {
        const siteId = req.params.id || req.params.siteId || req.body.siteId;
        if (!siteId || siteId === 'undefined' || siteId === 'null' || !mongoose_1.default.Types.ObjectId.isValid(siteId)) {
            return next();
        }
        const site = await Site_1.Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found.' });
        }
        if (site.status === 'CLOSED' && req.user?.role !== 'OWNER') {
            return res.status(403).json({
                success: false,
                message: 'This site is CLOSED. Only the Owner can modify entries or reopen the site.'
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Error checking site status.' });
    }
};
exports.requireActiveSite = requireActiveSite;
/**
 * Requires OWNER role for site-wide administrative actions (Close site, Reopen, Add/Remove members).
 */
const requireSiteOwner = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        if (user.role !== 'OWNER') {
            return res.status(403).json({
                success: false,
                message: 'Only the Owner can perform this action (e.g. site management, member access, closing site).'
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.requireSiteOwner = requireSiteOwner;
