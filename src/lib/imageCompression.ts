import imageCompression from 'browser-image-compression';
import { enhanceImage } from './imageEnhance';

const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1080,
  maxSizeMB: 1,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.7,
};

/**
 * Auto-enhance (crop unwanted borders + fix lighting) then compress an image
 * client-side before upload. Always outputs a single format: WebP.
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-image files (e.g. videos)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const enhanced = await enhanceImage(file);

  try {
    const compressed = await imageCompression(enhanced, COMPRESSION_OPTIONS);
    // Return as a new File with .webp extension
    const newName = enhanced.name.replace(/\.[^.]+$/, '.webp');
    return new File([compressed], newName, { type: 'image/webp' });
  } catch (error) {
    console.warn('Image compression failed, using enhanced original:', error);
    return enhanced;
  }
}

