import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';

/**
 * Ensures user has access to the site (either Owner global role, Site Creator, or assigned Site Member).
 */
export const requireSiteAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const siteId = req.params.id || req.params.siteId || req.body.siteId;

    if (!siteId) {
      return res.status(400).json({ success: false, message: 'Site ID is required.' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    // Owner role has global access to all sites
    if (user.role === 'OWNER' || site.createdBy.toString() === user._id.toString()) {
      req.siteRole = 'OWNER';
      return next();
    }

    // Check membership
    const membership = await SiteMember.findOne({ siteId: site._id, userId: user._id });
    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this site.'
      });
    }

    req.siteRole = membership.role;
    next();
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error checking site authorization.' });
  }
};

/**
 * Ensures site is ACTIVE when writing/modifying data. If CLOSED, only OWNER can edit.
 */
export const requireActiveSite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const siteId = req.params.id || req.params.siteId || req.body.siteId;
    if (!siteId) return next();

    const site = await Site.findById(siteId);
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error checking site status.' });
  }
};

/**
 * Requires OWNER role for site-wide administrative actions (Close site, Reopen, Add/Remove members).
 */
export const requireSiteOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
