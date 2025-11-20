export enum CompressionStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: CompressionStatus;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number;
  error?: string;
}

export enum OutputFormat {
  ORIGINAL = 'original',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export interface AppSettings {
  quality: number; // 0.1 to 1.0
  outputFormat: OutputFormat;
  keepOriginalName: boolean; // true = filename.jpg, false = filename-min.jpg
  maxWidth?: number; // Optional resize
}