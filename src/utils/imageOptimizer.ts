/**
 * Image Optimization Utility for Shruthi Fashion
 * Automatically compresses and resizes high-resolution device gallery photos
 * so they fit smoothly in localStorage, transfer in milliseconds, and never
 * exceed server payload limits.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compresses an image file or Data URL to an optimized JPEG/WebP Data URL
 */
export async function compressImage(
  input: File | string,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options;

  let originalDataUrl: string;
  let originalSize = 0;

  if (typeof input === 'string') {
    originalDataUrl = input;
    originalSize = Math.round((input.length * 3) / 4);
  } else {
    originalSize = input.size;
    originalDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(input);
    });
  }

  // If already a remote URL (http/https), return as-is
  if (originalDataUrl.startsWith('http://') || originalDataUrl.startsWith('https://')) {
    return { dataUrl: originalDataUrl, originalSize: 0, compressedSize: 0 };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Scale down proportionally if larger than maximum bounds
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          dataUrl: originalDataUrl,
          originalSize,
          compressedSize: originalSize,
        });
        return;
      }

      // Draw with white background in case source has transparent png channels
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

      resolve({
        dataUrl: compressedDataUrl,
        originalSize,
        compressedSize,
      });
    };

    img.onerror = () => {
      // Return original on error
      resolve({
        dataUrl: originalDataUrl,
        originalSize,
        compressedSize: originalSize,
      });
    };

    img.src = originalDataUrl;
  });
}
