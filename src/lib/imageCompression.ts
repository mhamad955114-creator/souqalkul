import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1080,
  maxSizeMB: 1,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.7,
};

/**
 * Compress an image file client-side before upload.
 * Converts to WebP, max 1080px, 70% quality.
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-image files (e.g. videos)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
    // Return as a new File with .webp extension
    const newName = file.name.replace(/\.[^.]+$/, '.webp');
    return new File([compressed], newName, { type: 'image/webp' });
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}
