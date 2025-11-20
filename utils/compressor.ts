import { OutputFormat } from '../types';

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const compressImage = async (
  file: File,
  quality: number,
  outputFormat: OutputFormat,
  maxWidth?: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;

      // Resize logic
      if (maxWidth && width > maxWidth) {
        const scaleFactor = maxWidth / width;
        width = maxWidth;
        height = height * scaleFactor;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Determine mime type
      let mimeType = file.type;
      if (outputFormat !== OutputFormat.ORIGINAL) {
        mimeType = outputFormat;
      }

      // Fallback for PNG transparency if converting to JPEG (fill white background)
      if (mimeType === 'image/jpeg' && file.type === 'image/png') {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        const newCtx = newCanvas.getContext('2d');
        if(newCtx) {
            newCtx.fillStyle = '#FFFFFF';
            newCtx.fillRect(0, 0, width, height);
            newCtx.drawImage(canvas, 0, 0);
            newCtx.canvas.toBlob(
                (blob) => {
                    if(blob) resolve(blob);
                    else reject(new Error('Compression failed'));
                },
                mimeType,
                quality
            );
            return;
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
};