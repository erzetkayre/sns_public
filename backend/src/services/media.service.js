/**
 * Media Download Service
 * Downloads Instagram media from URLs and saves locally
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create media storage directory
const MEDIA_DIR = path.join(__dirname, '../../public/media');
const THUMBNAILS_DIR = path.join(MEDIA_DIR, 'thumbnails');
const VIDEOS_DIR = path.join(MEDIA_DIR, 'videos');

// Create directories if they don't exist
function ensureDirectories() {
  [MEDIA_DIR, THUMBNAILS_DIR, VIDEOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[MEDIA] Created directory: ${dir}`);
    }
  });
}

/**
 * Download file from URL and save locally
 * @param {string} url - File URL
 * @param {string} mediaType - 'thumbnail' or 'video'
 * @returns {Promise<{localPath: string, fileName: string}>}
 */
async function downloadFile(url, mediaType) {
  try {
    // Determine file extension
    const ext = mediaType === 'video' ? '.mp4' : '.jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;

    const targetDir = mediaType === 'video' ? VIDEOS_DIR : THUMBNAILS_DIR;
    const filePath = path.join(targetDir, fileName);
    const relativePath = `/media/${mediaType === 'video' ? 'videos' : 'thumbnails'}/${fileName}`;

    // Download file
    console.log(`[MEDIA] Downloading from: ${url.substring(0, 80)}...`);
    const response = await fetch(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Save file
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log(`[MEDIA] Saved: ${fileName} (${(buffer.length / 1024).toFixed(2)} KB)`);

    return {
      localPath: relativePath,
      fileName: fileName,
      fileSize: buffer.length,
      mediaType: mediaType
    };
  } catch (error) {
    console.error(`[MEDIA] Error downloading file:`, error.message);
    throw error;
  }
}

/**
 * Download all media files for a post
 * @param {string} postId - Post ID from database
 * @returns {Promise<number>} Number of files downloaded
 */
export async function downloadPostMedia(postId) {
  try {
    ensureDirectories();

    // Get media files for this post
    const mediaFiles = await prisma.mediaFile.findMany({
      where: { postId }
    });

    if (mediaFiles.length === 0) {
      console.log(`[MEDIA] No media files found for post ${postId}`);
      return 0;
    }

    let downloaded = 0;

    for (const media of mediaFiles) {
      try {
        // Skip if already downloaded
        if (media.storageKey) {
          console.log(`[MEDIA] Already downloaded: ${media.storageKey}`);
          continue;
        }

        // Skip if no URL
        if (!media.originalUrl) {
          console.warn(`[MEDIA] No URL for media ${media.id}`);
          continue;
        }

        // Download file
        const result = await downloadFile(media.originalUrl, media.mediaType);

        // Update database with local path
        await prisma.mediaFile.update({
          where: { id: media.id },
          data: {
            storageKey: result.localPath,
            fileSizeMb: parseFloat((result.fileSize / (1024 * 1024)).toFixed(2)),
            mimeType: media.mediaType === 'video' ? 'video/mp4' : 'image/jpeg'
          }
        });

        downloaded++;
        console.log(`[MEDIA] Updated media ${media.id} with local path`);
      } catch (error) {
        console.error(`[MEDIA] Error processing media ${media.id}:`, error.message);
        // Continue to next file on error
      }
    }

    return downloaded;
  } catch (error) {
    console.error('[MEDIA] Error downloading post media:', error.message);
    throw error;
  }
}

/**
 * Download all media for all posts by a user
 * @param {string} userId - User ID
 * @returns {Promise<{total: number, downloaded: number}>}
 */
export async function downloadUserMedia(userId) {
  try {
    ensureDirectories();

    // Get all posts for user
    const posts = await prisma.post.findMany({
      where: {
        account: {
          userId
        }
      },
      include: {
        mediaFiles: true
      }
    });

    console.log(`[MEDIA] Found ${posts.length} posts for user ${userId}`);

    let totalMediaFiles = 0;
    let downloaded = 0;

    for (const post of posts) {
      totalMediaFiles += post.mediaFiles.length;

      for (const media of post.mediaFiles) {
        try {
          // Skip if already downloaded
          if (media.storageKey) {
            console.log(`[MEDIA] Already downloaded: ${media.storageKey}`);
            continue;
          }

          if (!media.originalUrl) continue;

          // Download
          const result = await downloadFile(media.originalUrl, media.mediaType);

          // Update DB
          await prisma.mediaFile.update({
            where: { id: media.id },
            data: {
              storageKey: result.localPath,
              fileSizeMb: parseFloat((result.fileSize / (1024 * 1024)).toFixed(2))
            }
          });

          downloaded++;
        } catch (error) {
          console.error(`[MEDIA] Error with media ${media.id}:`, error.message);
        }
      }
    }

    console.log(`[MEDIA] Download complete: ${downloaded}/${totalMediaFiles} files`);
    return {
      total: totalMediaFiles,
      downloaded
    };
  } catch (error) {
    console.error('[MEDIA] Error downloading user media:', error.message);
    throw error;
  }
}

/**
 * Get local file path for media
 * @param {string} mediaId - Media ID from database
 * @returns {Promise<{localPath: string, originalUrl: string}>}
 */
export async function getMediaPath(mediaId) {
  const media = await prisma.mediaFile.findUnique({
    where: { id: mediaId }
  });

  if (!media) {
    throw new Error(`Media ${mediaId} not found`);
  }

  return {
    localPath: media.storageKey,
    originalUrl: media.originalUrl,
    mediaType: media.mediaType,
    fileSize: media.fileSizeMb
  };
}
