import { Site } from '../models/Site';
import { SiteImage } from '../models/SiteImage';
import { deleteSitePhotosFromImageKit } from './imageKitService';
import { ActivityLog } from '../models/ActivityLog';

/**
 * Automatically cleans up site images for sites that have been CLOSED for 2 weeks (14 days).
 * Deletes photos from ImageKit cloud storage and removes database records.
 */
export const cleanupExpiredClosedSiteImages = async (): Promise<void> => {
  try {
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
    const expirationThreshold = new Date(Date.now() - TWO_WEEKS_MS);

    // Find all closed sites where closedAt <= (now - 14 days)
    const expiredClosedSites = await Site.find({
      status: 'CLOSED',
      closedAt: { $exists: true, $ne: null, $lte: expirationThreshold }
    });

    if (expiredClosedSites.length === 0) {
      return;
    }

    console.log(`[Auto Cleanup Service] Checking ${expiredClosedSites.length} closed sites older than 14 days...`);

    for (const site of expiredClosedSites) {
      const siteImages = await SiteImage.find({ siteId: site._id });

      if (siteImages.length > 0) {
        console.log(`[Auto Cleanup Service] Deleting ${siteImages.length} images for site "${site.siteName}" (${site._id}) from ImageKit & Database...`);

        // 1. Delete all images from ImageKit cloud storage
        await deleteSitePhotosFromImageKit(siteImages);

        // 2. Remove SiteImage records from MongoDB
        await SiteImage.deleteMany({ siteId: site._id });

        // 3. Log cleanup activity
        await ActivityLog.create({
          siteId: site._id,
          userName: 'System Auto-Cleanup',
          action: 'SITE_IMAGE_DELETED',
          details: `Automatically deleted ${siteImages.length} site photos from ImageKit cloud storage and database (2 weeks post site closure policy).`
        });

        console.log(`[Auto Cleanup Service] Successfully deleted ${siteImages.length} photos for site "${site.siteName}".`);
      }
    }
  } catch (error: any) {
    console.error('[Auto Cleanup Service Error]:', error?.message || error);
  }
};

/**
 * Starts the daily recurring auto-cleanup background cron job.
 */
export const startImageCleanupCron = (): void => {
  console.log('⏰ [Auto Cleanup Service] 14-day Closed Site Image Retention Cron initialized.');

  // Run initial cleanup 10 seconds after server boot
  setTimeout(() => {
    cleanupExpiredClosedSiteImages();
  }, 10000);

  // Run automatically every 24 hours
  setInterval(() => {
    cleanupExpiredClosedSiteImages();
  }, 24 * 60 * 60 * 1000);
};
