import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Downloads an image from a URL and saves it locally
 * @param url - The URL of the image to download
 * @param localPath - The local file path where the image should be saved
 * @returns The local path if successful, or the original URL if download fails
 */
async function downloadImage(url: string, localPath: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to download image from ${url}: ${response.statusText}`);
      return url; // Fallback to original URL
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

    // Return the public path (remove the 'public' prefix)
    const publicPath = localPath.replace(/.*\/public/, '');
    console.log(`✓ Downloaded image: ${publicPath}`);
    return publicPath;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return url; // Fallback to original URL
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
 * @returns Object with local paths for featured image and gallery images
 */
export async function downloadProjectImages(
  slug: string,
  featuredImageUrl: string | undefined,
  galleryImageUrls: string[]
): Promise<{
  featuredImage: string | undefined;
  images: string[];
}> {
  const projectDir = path.join(
    path.dirname(__dirname),
    '..',
    'public',
    'images',
    'projects',
    slug
  );

  // Download featured image
  let localFeaturedImage: string | undefined;
  if (featuredImageUrl) {
    const ext = getExtension(featuredImageUrl);
    const localPath = path.join(projectDir, `featured.${ext}`);
    localFeaturedImage = await downloadImage(featuredImageUrl, localPath);
  }

  // Download gallery images
  const localGalleryImages: string[] = [];
  for (let i = 0; i < galleryImageUrls.length; i++) {
    const url = galleryImageUrls[i];
    const ext = getExtension(url);
    const localPath = path.join(projectDir, `gallery-${i + 1}.${ext}`);
    const localImagePath = await downloadImage(url, localPath);
    localGalleryImages.push(localImagePath);
  }

  return {
    featuredImage: localFeaturedImage,
    images: localGalleryImages,
  };
}
