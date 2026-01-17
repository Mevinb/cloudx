/**
 * Storage Service
 * Abstracted file storage service (Local/S3/Firebase compatible)
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

class StorageService {
  constructor() {
    this.storageType = 'database'; // Using database only, no local storage
    this.uploadPath = config.upload.path;
    
    // Local file storage disabled - using database only
    console.log('📦 Storage Service: Database-only mode (local storage disabled)');
  }
  
  /**
   * Ensure upload directory exists
   */
  ensureUploadDir() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }
  
  /**
   * Upload file
   * @param {Object} file - Multer file object
   * @param {String} folder - Subfolder for organization
   * @returns {Object} Upload result
   */
  async uploadFile(file, folder = '') {
    if (this.storageType === 'local') {
      return this.uploadToLocal(file, folder);
    }
    
    // Add S3/Firebase implementations here
    throw new Error(`Storage type '${this.storageType}' not implemented`);
  }
  
  /**
   * Upload to local filesystem
   */
  async uploadToLocal(file, folder) {
    const targetDir = folder 
      ? path.join(this.uploadPath, folder)
      : this.uploadPath;
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const fileKey = file.filename;
    const filePath = folder ? `${folder}/${fileKey}` : fileKey;
    
    return {
      success: true,
      fileKey,
      url: `/uploads/${filePath}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }
  
  /**
   * Delete file
   * @param {String} fileKey - File key/name
   * @param {String} folder - Subfolder
   */
  async deleteFile(fileKey, folder = '') {
    if (this.storageType === 'local') {
      return this.deleteFromLocal(fileKey, folder);
    }
    
    throw new Error(`Storage type '${this.storageType}' not implemented`);
  }
  
  /**
   * Delete from local filesystem
   */
  async deleteFromLocal(fileKey, folder) {
    const filePath = folder 
      ? path.join(this.uploadPath, folder, fileKey)
      : path.join(this.uploadPath, fileKey);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
      return { success: false, message: 'File not found' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Get file URL
   * @param {String} fileKey - File key
   * @param {String} folder - Subfolder
   */
  getFileUrl(fileKey, folder = '') {
    if (this.storageType === 'local') {
      return folder ? `/uploads/${folder}/${fileKey}` : `/uploads/${fileKey}`;
    }
    
    // For cloud storage, return signed URL
    return null;
  }
  
  /**
   * Check if file exists
   */
  async fileExists(fileKey, folder = '') {
    if (this.storageType === 'local') {
      const filePath = folder 
        ? path.join(this.uploadPath, folder, fileKey)
        : path.join(this.uploadPath, fileKey);
      
      return fs.existsSync(filePath);
    }
    
    return false;
  }
}

// Export singleton instance
module.exports = new StorageService();
