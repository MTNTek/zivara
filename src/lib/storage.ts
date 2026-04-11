/**
 * Storage service for handling file uploads.
 *
 * Strategy:
 * - Stores files locally in /public/uploads
 * - For Vercel/serverless, set STORAGE_URL env var to point to your CDN
 *   and handle uploads via a separate API (e.g., presigned S3 URLs)
 *
 * To add S3 support: install @aws-sdk/client-s3, set S3_BUCKET + AWS_REGION,
 * and uncomment the S3 functions below.
 */

import { logger } from '@/lib/logger';
import path from 'path';
import fs from 'fs/promises';

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  publicId?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be JPEG, PNG, or WebP format');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File size must be less than 5 MB');
  }
}

function uniqueName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureDir(subdir?: string) {
  const dir = subdir ? path.join(UPLOAD_DIR, subdir) : UPLOAD_DIR;
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Upload an image file to local storage.
 */
export async function uploadImage(file: File, folder?: string): Promise<UploadResult> {
  validateImageFile(file);

  const filename = uniqueName(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = await ensureDir(folder);
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);

  const relativePath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;
  const baseUrl = process.env.STORAGE_URL || '';

  logger.info('Image uploaded', { path: relativePath });

  return {
    url: `${baseUrl}${relativePath}`,
    thumbnailUrl: `${baseUrl}${relativePath}`, // Use Next.js Image for resizing
    publicId: relativePath,
  };
}

/**
 * Delete an image from local storage.
 */
export async function deleteImage(urlOrPath: string): Promise<void> {
  try {
    // Strip base URL if present
    const relativePath = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname
      : urlOrPath;
    const filePath = path.join(process.cwd(), 'public', relativePath);
    await fs.unlink(filePath);
    logger.info('Image deleted', { path: relativePath });
  } catch {
    // File may already be deleted
  }
}

/**
 * Get optimized image URL. Relies on Next.js Image component for optimization.
 */
export function getOptimizedImageUrl(url: string): string {
  return url;
}
