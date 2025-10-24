import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { loadManifest, saveManifest, needsUpdate, updateManifestEntry } from './imageManifest';
import type { ImageManifest } from './imageManifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load manifest once at module level
let manifest: ImageManifest | null = null;
function getManifest(): ImageManifest {
  if (!manifest) {
    manifest = loadManifest();
  }
  return manifest;
}

/**
 * Downloads an image from a URL and saves it locally
 * @param url - The URL of the image to download
 * @param localPath - The local file path where the image should be saved
 * @returns Object with the local path and whether it was cached
 */
async function downloadImage(url: string, localPath: string): Promise<{ path: string; cached: boolean }> {
  try {
    const currentManifest = getManifest();
    const publicPath = localPath.replace(/.*\/public/, '');

    // Check manifest first - if image doesn't need update, skip entirely
    if (!needsUpdate(url, localPath, currentManifest)) {
      // File is cached and doesn't need revalidation
      console.log(`⊘ Cached: ${path.basename(publicPath)}`);
      return { path: publicPath, cached: true };
    }

    // Need to check or download the image
    // Check if file already exists
    if (fs.existsSync(localPath)) {
      // File exists - check if it needs updating by comparing file size
      const localStats = fs.statSync(localPath);

      // Do a HEAD request to get remote file size without downloading
      const headResponse = await fetch(url, { method: 'HEAD' });
      if (headResponse.ok) {
        const remoteSize = headResponse.headers.get('content-length');

        if (remoteSize && parseInt(remoteSize) === localStats.size) {
          // File exists and sizes match - update manifest and skip download
          updateManifestEntry(url, publicPath, localStats.size, currentManifest);
          console.log(`⊘ Verified: ${path.basename(publicPath)}`);
          return { path: publicPath, cached: true };
        }
      }
    }

    // File doesn't exist or needs updating - download it
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to download image from ${url}: ${response.statusText}`);
      return { path: url, cached: false }; // Fallback to original URL
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Ensure directory exists
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(localPath, uint8Array);

    // Update manifest
    const size = uint8Array.length;
    updateManifestEntry(url, publicPath, size, currentManifest);

    console.log(`✓ Downloaded: ${path.basename(publicPath)}`);
    return { path: publicPath, cached: false };
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return { path: url, cached: false }; // Fallback to original URL
  }
}

/**
 * Gets the file extension from a URL
 */
function getExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
  return match ? match[1] : 'jpg';
}

/**
 * Downloads project images and returns updated paths
 * @param slug - The project slug (used for organizing images)
 * @param featuredImageUrl - URL of the featured image
 * @param galleryImageUrls - Array of gallery image URLs
 * @returns Object with local paths for featured image and gallery images, plus download stats
 */
export async function downloadProjectImages(
  slug: string,
  featuredImageUrl: string | undefined,
  galleryImageUrls: string[]
): Promise<{
  featuredImage: string | undefined;
  images: string[];
  stats: {
    downloaded: number;
    cached: number;
  };
}> {
  const projectDir = path.join(
    path.dirname(__dirname),
    '..',
    'public',
    'images',
    'projects',
    slug
  );

  let downloadedCount = 0;
  let cachedCount = 0;

  // Download featured image
  let localFeaturedImage: string | undefined;
  if (featuredImageUrl) {
    const ext = getExtension(featuredImageUrl);
    const localPath = path.join(projectDir, `featured.${ext}`);
    const result = await downloadImage(featuredImageUrl, localPath);
    localFeaturedImage = result.path;
    if (result.cached) {
      cachedCount++;
    } else {
      downloadedCount++;
    }
  }

  // Download gallery images
  const localGalleryImages: string[] = [];
  for (let i = 0; i < galleryImageUrls.length; i++) {
    const url = galleryImageUrls[i];
    const ext = getExtension(url);
    const localPath = path.join(projectDir, `gallery-${i + 1}.${ext}`);
    const result = await downloadImage(url, localPath);
    localGalleryImages.push(result.path);
    if (result.cached) {
      cachedCount++;
    } else {
      downloadedCount++;
    }
  }

  // Save manifest after processing all images for this project
  saveManifest(getManifest());

  return {
    featuredImage: localFeaturedImage,
    images: localGalleryImages,
    stats: {
      downloaded: downloadedCount,
      cached: cachedCount,
    },
  };
}
