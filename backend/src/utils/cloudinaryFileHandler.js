const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const archiver = require('archiver');
const https = require('https');
const http = require('http');

class CloudinaryFileHandler {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  /**
   * Upload a buffer to Cloudinary
   * @param {Buffer} buffer - The file buffer
   * @param {Object} options - Cloudinary upload options
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  _uploadBuffer(buffer, options) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Create/upload files to Cloudinary
   * @param {string} category - Document category
   * @param {string} id - Document ID
   * @param {string} docType - Type: 'cover' or 'document'
   * @param {Array} files - Array of file objects with buffer and originalname
   * @returns {Promise<Array|boolean>} - Array of Cloudinary URLs or false on error
   */
  async createFile(category, id, docType, files) {
    try {
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.split('.').pop().toLowerCase();
        
        // Determine resource type based on file extension
        let resourceType = 'raw';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
          resourceType = 'image';
        }

        const publicId = `digital_repo/${category}/${id}/${docType}/${i}_${file.originalname.replace(/\.[^/.]+$/, '')}`;
        
        const options = {
          public_id: publicId,
          resource_type: resourceType,
          folder: '', // Folder is included in public_id
          overwrite: true,
          unique_filename: false
        };

        const result = await this._uploadBuffer(file.buffer, options);
        uploadedFiles.push({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: resourceType,
          original_name: file.originalname
        });
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return false;
    }
  }

  /**
   * Update files on Cloudinary (delete old and upload new)
   * @param {string} category - Document category
   * @param {string} id - Document ID
   * @param {string} docType - Type: 'cover' or 'document'
   * @param {Array} files - Array of file objects with buffer and originalname
   * @returns {Promise<Array|boolean>} - Array of Cloudinary URLs or false on error
   */
  async updateFile(category, id, docType, files) {
    try {
      // Delete existing files first
      await this.deleteFiles(category, id, docType);
      
      // Upload new files
      return await this.createFile(category, id, docType, files);
    } catch (error) {
      console.error('Error updating files on Cloudinary:', error);
      return false;
    }
  }

  /**
   * Delete files from Cloudinary
   * @param {string} category - Document category
   * @param {string} id - Document ID
   * @param {string} docType - Optional specific type to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFiles(category, id, docType = null) {
    try {
      let prefix;
      if (docType) {
        prefix = `digital_repo/${category}/${id}/${docType}`;
      } else {
        prefix = `digital_repo/${category}/${id}`;
      }

      // Delete all resources with the prefix
      // Need to delete both images and raw files
      const resourceTypes = ['image', 'raw'];
      
      for (const type of resourceTypes) {
        try {
          // Get all resources with this prefix
          const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: prefix,
            resource_type: type,
            max_results: 500
          });

          if (resources.resources && resources.resources.length > 0) {
            const publicIds = resources.resources.map(r => r.public_id);
            await cloudinary.api.delete_resources(publicIds, { resource_type: type });
          }
        } catch (err) {
          // Ignore errors for resource types that don't exist
          if (err.error && err.error.http_code !== 404) {
            console.error(`Error deleting ${type} resources:`, err);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting files from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Get cover image from Cloudinary
   * @param {string} category - Document category
   * @param {string} id - Document ID
   * @returns {Promise<string|null>} - Base64 encoded image or null
   */
  async getCover(category, id) {
    try {
      const prefix = `digital_repo/${category}/${id}/cover`;
      
      // Try to get image resources first
      let resources;
      try {
        resources = await cloudinary.api.resources({
          type: 'upload',
          prefix: prefix,
          resource_type: 'image',
          max_results: 1
        });
      } catch (err) {
        // Try raw if no images found
        resources = await cloudinary.api.resources({
          type: 'upload',
          prefix: prefix,
          resource_type: 'raw',
          max_results: 1
        });
      }

      if (!resources.resources || resources.resources.length === 0) {
        return null;
      }

      const coverUrl = resources.resources[0].secure_url;
      
      // Download the file and convert to base64
      const base64 = await this._downloadAsBase64(coverUrl);
      return base64;
    } catch (error) {
      console.error('Error getting cover from Cloudinary:', error);
      return null;
    }
  }

  /**
   * Download a file from URL and return as base64
   * @param {string} url - The file URL
   * @returns {Promise<string>} - Base64 encoded content
   */
  _downloadAsBase64(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer.toString('base64'));
        });
        response.on('error', reject);
      }).on('error', reject);
    });
  }

  /**
   * Download file buffer from URL
   * @param {string} url - The file URL
   * @returns {Promise<Buffer>} - File buffer
   */
  _downloadBuffer(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        response.on('error', reject);
      }).on('error', reject);
    });
  }

  /**
   * Get documents as a zip file
   * @param {string} category - Document category  
   * @param {string} id - Document ID
   * @returns {Promise<Object>} - { file: Buffer, success: boolean }
   */
  async getZip(category, id) {
    return new Promise(async (resolve) => {
      try {
        const prefix = `digital_repo/${category}/${id}/document`;
        
        // Get all resources (both images and raw files)
        let allResources = [];
        
        for (const type of ['image', 'raw']) {
          try {
            const resources = await cloudinary.api.resources({
              type: 'upload',
              prefix: prefix,
              resource_type: type,
              max_results: 500
            });
            if (resources.resources) {
              allResources = allResources.concat(resources.resources);
            }
          } catch (err) {
            // Ignore errors
          }
        }

        if (allResources.length === 0) {
          return resolve({ file: null, success: false });
        }

        // Create a zip archive in memory
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks = [];

        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => {
          const zipBuffer = Buffer.concat(chunks);
          resolve({ file: zipBuffer, success: true });
        });
        archive.on('error', (err) => {
          console.error('Archive error:', err);
          resolve({ file: null, success: false });
        });

        // Download each file and add to archive
        for (const resource of allResources) {
          try {
            const buffer = await this._downloadBuffer(resource.secure_url);
            // Extract original filename from public_id
            const parts = resource.public_id.split('/');
            let filename = parts[parts.length - 1];
            
            // Add extension if not present
            if (resource.format && !filename.includes('.')) {
              filename = `${filename}.${resource.format}`;
            }
            
            archive.append(buffer, { name: filename });
          } catch (err) {
            console.error('Error downloading file for zip:', err);
          }
        }

        archive.finalize();
      } catch (error) {
        console.error('Error creating zip from Cloudinary:', error);
        resolve({ file: null, success: false });
      }
    });
  }

  /**
   * Get the URL for a cover image
   * @param {string} category - Document category
   * @param {string} id - Document ID
   * @returns {Promise<string|null>} - Cover URL or null
   */
  async getCoverUrl(category, id) {
    try {
      const prefix = `digital_repo/${category}/${id}/cover`;
      
      // Try image resources first
      for (const type of ['image', 'raw']) {
        try {
          const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: prefix,
            resource_type: type,
            max_results: 1
          });
          
          if (resources.resources && resources.resources.length > 0) {
            return resources.resources[0].secure_url;
          }
        } catch (err) {
          // Continue to next type
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cover URL:', error);
      return null;
    }
  }

  /**
   * Get all document URLs
   * @param {string} category - Document category
   * @param {string} id - Document ID
   * @returns {Promise<Array>} - Array of document URLs
   */
  async getDocumentUrls(category, id) {
    try {
      const prefix = `digital_repo/${category}/${id}/document`;
      let allResources = [];
      
      for (const type of ['image', 'raw']) {
        try {
          const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: prefix,
            resource_type: type,
            max_results: 500
          });
          if (resources.resources) {
            allResources = allResources.concat(resources.resources.map(r => ({
              url: r.secure_url,
              public_id: r.public_id,
              format: r.format
            })));
          }
        } catch (err) {
          // Ignore
        }
      }
      
      return allResources;
    } catch (error) {
      console.error('Error getting document URLs:', error);
      return [];
    }
  }
}

module.exports = CloudinaryFileHandler;
