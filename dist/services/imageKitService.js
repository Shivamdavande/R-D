"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromImageKit = exports.uploadToImageKit = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
/**
 * Uploads an image file to ImageKit securely from the backend.
 * Never exposes private keys to client apps.
 */
const uploadToImageKit = async (fileBuffer, fileName, folder = '/site_images') => {
    const { publicKey, privateKey, urlEndpoint } = env_1.config.imageKit;
    // Check if ImageKit credentials are model configured
    if (privateKey && privateKey.trim() !== '' && publicKey && publicKey.trim() !== '') {
        try {
            const base64File = fileBuffer.toString('base64');
            const authHeader = 'Basic ' + Buffer.from(`${privateKey}:`).toString('base64');
            const formData = new URLSearchParams();
            formData.append('file', base64File);
            formData.append('fileName', fileName);
            formData.append('folder', folder);
            const response = await axios_1.default.post('https://upload.imagekit.io/api/v1/files/upload', formData, {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (response.data && response.data.url) {
                return {
                    fileId: response.data.fileId || `ik_${Date.now()}`,
                    url: response.data.url,
                    name: response.data.name || fileName
                };
            }
        }
        catch (err) {
            console.error('ImageKit API upload error:', err?.response?.data || err?.message || err);
            // Fallback to local storage if API call fails
        }
    }
    // Local storage fallback if ImageKit keys not provided or API unavailable
    const siteDir = path_1.default.join(__dirname, '../../uploads/site-images');
    if (!fs_1.default.existsSync(siteDir)) {
        fs_1.default.mkdirSync(siteDir, { recursive: true });
    }
    const hasExt = /\.(jpg|jpeg|png|webp)$/i.test(fileName);
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeExt = hasExt ? path_1.default.extname(fileName) : '.jpg';
    const safeName = `${Date.now()}_${cleanName || 'site_photo'}${safeExt}`;
    const filePath = path_1.default.join(siteDir, safeName);
    fs_1.default.writeFileSync(filePath, fileBuffer);
    const localUrl = `/uploads/site-images/${safeName}`;
    return {
        fileId: `local_${safeName}`,
        url: localUrl,
        name: `${cleanName || 'site_photo'}${safeExt}`
    };
};
exports.uploadToImageKit = uploadToImageKit;
/**
 * Deletes an image from ImageKit securely using fileId.
 */
const deleteFromImageKit = async (fileId) => {
    if (!fileId)
        return true;
    const { privateKey } = env_1.config.imageKit;
    // If local file
    if (fileId.startsWith('local_')) {
        const filename = fileId.replace('local_', '');
        const filePath = path_1.default.join(__dirname, '../../uploads/site-images', filename);
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
            }
            catch (e) {
                console.error('Error removing local file:', e);
            }
        }
        return true;
    }
    // ImageKit file deletion via API
    if (privateKey && privateKey.trim() !== '') {
        try {
            const authHeader = 'Basic ' + Buffer.from(`${privateKey}:`).toString('base64');
            await axios_1.default.delete(`https://api.imagekit.io/v1/files/${fileId}`, {
                headers: {
                    Authorization: authHeader
                }
            });
            return true;
        }
        catch (err) {
            console.error('ImageKit API delete error:', err?.response?.data || err?.message || err);
            return false;
        }
    }
    return true;
};
exports.deleteFromImageKit = deleteFromImageKit;
