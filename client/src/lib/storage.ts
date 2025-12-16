import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/config/firebase";

export type StorageFolder = "posters" | "trailers" | "films" | "avatars";

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  folder: StorageFolder,
  fileName?: string
): Promise<string> {
  const name = fileName || `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${name}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Get file extension from file name
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file type for uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// Max file sizes in MB
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_TRAILER_SIZE_MB = 100;
export const MAX_FILM_SIZE_MB = 5000; // 5GB
