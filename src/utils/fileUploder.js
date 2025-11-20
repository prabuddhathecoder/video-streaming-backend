import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
});

const uploadFile = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    // Determine resource type by extension
    const ext = path.extname(localFilePath).toLowerCase();
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    let resourceType = 'image';
    if (videoExtensions.includes(ext)) {
      resourceType = 'video';
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
    });

    console.log("File uploaded:", result.secure_url || result.url);
    if (resourceType === 'video') {
      console.log("Video duration:", result.duration);
    }

    // Delete temp file
    try {
      if (fsSync.existsSync(localFilePath)) {
        await fs.unlink(localFilePath);
      }
    } catch (delErr) {
      console.warn("Failed to delete temp file:", delErr);
    }

    return result;
  } catch (error) {
    // Remove temp file on error
    try {
      if (fsSync.existsSync(localFilePath)) {
        await fs.unlink(localFilePath);
      }
    } catch (delErr) {
      console.warn("Failed to delete temp file after upload error:", delErr);
    }

    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

export { uploadFile };