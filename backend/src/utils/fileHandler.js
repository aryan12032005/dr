const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class FileHandler {
  constructor(workDir) {
    this.workDir = workDir;
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }
  }

  createFile(category, id, docType, files) {
    const tempDir = path.join(this.workDir, category, String(id), docType);
    
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      
      files.forEach((file, index) => {
        const fileName = `${index}_${file.originalname}`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
      });
      
      return tempDir;
    } catch (error) {
      console.error('Error creating file:', error);
      return false;
    }
  }

  updateFile(category, id, docType, files) {
    const tempDir = path.join(this.workDir, category, String(id), docType);
    
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }
      fs.mkdirSync(tempDir, { recursive: true });
      
      files.forEach((file, index) => {
        const fileName = `${index}_${file.originalname}`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
      });
      
      return tempDir;
    } catch (error) {
      console.error('Error updating file:', error);
      return false;
    }
  }

  deleteFiles(category, id, docType = null) {
    try {
      let tempDir;
      if (docType) {
        tempDir = path.join(this.workDir, category, String(id), docType);
      } else {
        tempDir = path.join(this.workDir, category, String(id));
      }
      
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }
      return true;
    } catch (error) {
      console.error('Error deleting files:', error);
      return false;
    }
  }

  getCover(category, id) {
    try {
      const folderDir = path.join(this.workDir, category, String(id), 'cover');
      
      if (!fs.existsSync(folderDir)) {
        return null;
      }
      
      const files = fs.readdirSync(folderDir);
      if (files.length === 0) {
        return null;
      }
      
      const fileName = files[0];
      const filePath = path.join(folderDir, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      
      return fileBuffer.toString('base64');
    } catch (error) {
      console.error('Error getting cover:', error);
      return null;
    }
  }

  async getZip(category, id) {
    return new Promise((resolve, reject) => {
      try {
        const folderDir = path.join(this.workDir, category, String(id), 'document');
        const zipDir = path.join(this.workDir, 'ZIP');
        const zipPath = path.join(zipDir, `${id}.zip`);
        
        if (!fs.existsSync(folderDir)) {
          return resolve({ file: null, success: false });
        }
        
        fs.mkdirSync(zipDir, { recursive: true });
        
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
          const zipBuffer = fs.readFileSync(zipPath);
          // Clean up zip file after reading
          setTimeout(() => {
            if (fs.existsSync(zipPath)) {
              fs.unlinkSync(zipPath);
            }
          }, 5000);
          resolve({ file: zipBuffer, success: true });
        });
        
        archive.on('error', (err) => {
          reject(err);
        });
        
        archive.pipe(output);
        archive.directory(folderDir, false);
        archive.finalize();
      } catch (error) {
        console.error('Error creating zip:', error);
        resolve({ file: null, success: false });
      }
    });
  }
}

module.exports = FileHandler;
