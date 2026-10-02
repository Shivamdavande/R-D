"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteImagesPDF = exports.deleteSiteImage = exports.uploadSiteImage = exports.getSiteImages = void 0;
const Site_1 = require("../models/Site");
const SiteImage_1 = require("../models/SiteImage");
const ActivityLog_1 = require("../models/ActivityLog");
const imageKitService_1 = require("../services/imageKitService");
const imagePdfService_1 = require("../services/imagePdfService");
const env_1 = require("../config/env");
/**
 * GET /api/sites/:siteId/images
 * Get all images for a site.
 */
const getSiteImages = async (req, res) => {
    try {
        const siteId = req.params.siteId || req.params.id;
        if (!siteId) {
            return res.status(400).json({ success: false, message: 'Site ID is required.' });
        }
        const images = await SiteImage_1.SiteImage.find({ siteId })
            .populate('uploadedBy', 'name email role')
            .sort({ uploadedAt: -1, createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: images.length,
            images
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching site images.'
        });
    }
};
exports.getSiteImages = getSiteImages;
/**
 * POST /api/sites/:siteId/images
 * Upload new site image (handles file upload via multer or base64 payload).
 */
const uploadSiteImage = async (req, res) => {
    try {
        const siteId = req.params.siteId || req.params.id;
        const user = req.user;
        if (!siteId || !user) {
            return res.status(400).json({ success: false, message: 'Site ID and authentication required.' });
        }
        const site = await Site_1.Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found.' });
        }
        let fileBuffer = null;
        let fileName = `site_photo_${Date.now()}.jpg`;
        if (req.file) {
            fileBuffer = req.file.buffer || (req.file.path ? require('fs').readFileSync(req.file.path) : null);
            fileName = req.file.originalname || fileName;
        }
        else if (req.body.imageBase64) {
            const cleanBase64 = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
            fileBuffer = Buffer.from(cleanBase64, 'base64');
            if (req.body.fileName)
                fileName = req.body.fileName;
        }
        if (!fileBuffer) {
            return res.status(400).json({ success: false, message: 'No image file or base64 data provided.' });
        }
        // Secure ImageKit Upload
        const ikResult = await (0, imageKitService_1.uploadToImageKit)(fileBuffer, fileName, `/sites/${siteId}`);
        // Save to Database
        const siteImage = await SiteImage_1.SiteImage.create({
            siteId: site._id,
            imageUrl: ikResult.url,
            imageKitFileId: ikResult.fileId,
            fileName: ikResult.name || fileName,
            uploadedBy: user._id,
            uploadedAt: new Date()
        });
        await siteImage.populate('uploadedBy', 'name email role');
        // Log Activity
        await ActivityLog_1.ActivityLog.create({
            siteId: site._id,
            userId: user._id,
            userName: user.name,
            action: 'SITE_IMAGE_ADDED',
            details: `Uploaded new site photo: ${siteImage.fileName || 'Site Photo'}`
        });
        return res.status(201).json({
            success: true,
            message: 'Photo uploaded successfully.',
            image: siteImage
        });
    }
    catch (error) {
        console.error('Error uploading site photo:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload photo.'
        });
    }
};
exports.uploadSiteImage = uploadSiteImage;
/**
 * DELETE /api/sites/:siteId/images/:imageId
 * Delete a site photo.
 */
const deleteSiteImage = async (req, res) => {
    try {
        const { siteId, imageId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const image = await SiteImage_1.SiteImage.findById(imageId);
        if (!image) {
            return res.status(404).json({ success: false, message: 'Site image not found.' });
        }
        if (image.siteId.toString() !== (siteId || req.params.id)) {
            return res.status(400).json({ success: false, message: 'Image does not belong to specified site.' });
        }
        // Permission check: Owner or uploader or site supervisor
        const isOwner = user.role === 'OWNER';
        const isUploader = image.uploadedBy.toString() === user._id.toString();
        if (!isOwner && !isUploader && req.siteRole !== 'SUPERVISOR' && req.siteRole !== 'OWNER') {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this photo.' });
        }
        // Delete from ImageKit
        if (image.imageKitFileId) {
            await (0, imageKitService_1.deleteFromImageKit)(image.imageKitFileId);
        }
        // Delete DB record
        await SiteImage_1.SiteImage.findByIdAndDelete(imageId);
        // Log Activity
        await ActivityLog_1.ActivityLog.create({
            siteId: image.siteId,
            userId: user._id,
            userName: user.name,
            action: 'SITE_IMAGE_DELETED',
            details: `Deleted site photo: ${image.fileName || 'Photo'}`
        });
        return res.status(200).json({
            success: true,
            message: 'Photo deleted successfully.'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting site image.'
        });
    }
};
exports.deleteSiteImage = deleteSiteImage;
/**
 * GET /api/sites/:siteId/images/pdf
 * Export ALL site images as a single PDF.
 */
const getSiteImagesPDF = async (req, res) => {
    try {
        const siteId = req.params.siteId || req.params.id;
        const site = await Site_1.Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found.' });
        }
        const images = await SiteImage_1.SiteImage.find({ siteId })
            .populate('uploadedBy', 'name email role')
            .sort({ uploadedAt: -1 });
        if (images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No site photos available. Take at least one photo before exporting the PDF.'
            });
        }
        const pdfBuffer = await (0, imagePdfService_1.generateSiteImagesPDF)({
            site,
            images: images,
            companyName: env_1.config.companyName
        });
        const sanitizedSiteName = site.siteName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const today = new Date().toISOString().split('T')[0];
        const fileName = `${sanitizedSiteName}_SiteImages_${today}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error exporting site images PDF:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to export site images PDF.'
        });
    }
};
exports.getSiteImagesPDF = getSiteImagesPDF;
