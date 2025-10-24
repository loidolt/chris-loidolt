import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ImageManifestEntry {
  url: string;
  localPath: string;
  size: number;
  lastChecked: number;
}

export interface ImageManifest {
  [key: string]: ImageManifestEntry;
}

const MANIFEST_PATH = path.join(
  path.dirname(__dirname),
  '..',
  'public',
  'images',
  '.image-manifest.json'
);

/**
 * Generate a hash key from a URL
 */
function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * Load the image manifest
 */
export function loadManifest(): ImageManifest {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load image manifest, creating new one');
  }
  return {};
}

/**
 * Save the image manifest
 */
export function saveManifest(manifest: ImageManifest): void {
  const dir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/**
 * Check if an image needs to be updated based on the manifest
 * Returns true if the image needs to be downloaded
 */
export function needsUpdate(url: string, localPath: string, manifest: ImageManifest): boolean {
  const key = hashUrl(url);
  const entry = manifest[key];

  // If no manifest entry exists, we need to download
  if (!entry) {
    return true;
  }

  // If the URL changed, we need to download
  if (entry.url !== url) {
    return true;
  }

  // If the local file doesn't exist, we need to download
  if (!fs.existsSync(localPath)) {
    return true;
  }

  // If the local file size doesn't match the manifest, we need to download
  const localStats = fs.statSync(localPath);
  if (localStats.size !== entry.size) {
    return true;
  }

  // Check if it's been more than 24 hours since last check
  const hoursSinceLastCheck = (Date.now() - entry.lastChecked) / (1000 * 60 * 60);
  if (hoursSinceLastCheck > 24) {
    // Only re-validate once per day
    return true;
  }

  // Everything matches and was recently checked - no need to update
  return false;
}

/**
 * Update the manifest with a new or updated image
 */
export function updateManifestEntry(
  url: string,
  localPath: string,
  size: number,
  manifest: ImageManifest
): void {
  const key = hashUrl(url);
  manifest[key] = {
    url,
    localPath,
    size,
    lastChecked: Date.now(),
  };
}
