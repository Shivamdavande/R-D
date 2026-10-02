import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { config } from '../config/env';

export interface ImageKitUploadResult {
  fileId: string;
  url: string;
  name: string;
}

/**
 * Uploads an image file to ImageKit securely from the backend.
 * Never exposes private keys to client apps.
 */
export const uploadToImageKit = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = '/site_images'
): Promise<ImageKitUploadResult> => {
  const { publicKey, privateKey, urlEndpoint } = config.imageKit;

  // Check if ImageKit credentials are model configured
  if (privateKey && privateKey.trim() !== '' && publicKey && publicKey.trim() !== '') {
    try {
      const base64File = fileBuffer.toString('base64');
      const authHeader = 'Basic ' + Buffer.from(`${privateKey}:`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('file', base64File);
      formData.append('fileName', fileName);
      formData.append('folder', folder);

      const response = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData, {
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
    } catch (err: any) {
      console.error('ImageKit API upload error:', err?.response?.data || err?.message || err);
      // Fallback to local storage if API call fails
    }
  }

  // Local storage fallback if ImageKit keys not provided or API unavailable
  const siteDir = path.join(__dirname, '../../uploads/site-images');
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }

  const hasExt = /\.(jpg|jpeg|png|webp)$/i.test(fileName);
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeExt = hasExt ? path.extname(fileName) : '.jpg';
  const safeName = `${Date.now()}_${cleanName || 'site_photo'}${safeExt}`;
  const filePath = path.join(siteDir, safeName);
  fs.writeFileSync(filePath, fileBuffer);

  const localUrl = `/uploads/site-images/${safeName}`;
  return {
    fileId: `local_${safeName}`,
    url: localUrl,
    name: `${cleanName || 'site_photo'}${safeExt}`
  };
};

/**
 * Deletes an image from ImageKit securely using fileId.
 */
export const deleteFromImageKit = async (fileId?: string): Promise<boolean> => {
  if (!fileId) return true;

  const { privateKey } = config.imageKit;

  // If local file
  if (fileId.startsWith('local_')) {
    const filename = fileId.replace('local_', '');
    const filePath = path.join(__dirname, '../../uploads/site-images', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Error removing local file:', e);
      }
    }
    return true;
  }

  // ImageKit file deletion via API
  if (privateKey && privateKey.trim() !== '') {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${privateKey}:`).toString('base64');
      await axios.delete(`https://api.imagekit.io/v1/files/${fileId}`, {
        headers: {
          Authorization: authHeader
        }
      });
      return true;
    } catch (err: any) {
      console.error('ImageKit API delete error:', err?.response?.data || err?.message || err);
      return false;
    }
  }

  return true;
};
