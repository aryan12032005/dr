const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const Document = require('./src/models/Document');
const FILES_BASE = path.join(__dirname, 'FILES');

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

function getResourceType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) ? 'image' : 'raw';
}

function uploadFileWithRetry(filePath, options, retries = 3) {
  return new Promise((resolve, reject) => {
    function attempt(n) {
      cloudinary.uploader.upload(filePath, options, (err, res) => {
        if (!err) {
          return resolve(res);
        }
        if (n <= 1) {
          return reject(err);
        }
        console.warn(`    Retry upload ${path.basename(filePath)} (${n - 1} left)... error: ${err.message}`);
        setTimeout(() => attempt(n - 1), 2000);
      });
    }
    attempt(retries);
  });
}

async function uploadFolderFiles(category, docId, subfolder) {
  const folderPath = path.join(FILES_BASE, category, String(docId), subfolder);
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const fileNames = fs.readdirSync(folderPath);
  const results = [];

  for (let i = 0; i < fileNames.length; i++) {
    const filename = fileNames[i];
    const filePath = path.join(folderPath, filename);
    if (!fs.statSync(filePath).isFile()) continue;

    const resourceType = getResourceType(filename);
    const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = `digital_repo/${category}/${docId}/${subfolder}/${i}_${cleanName}`;

    const options = {
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
      unique_filename: false
    };

    const res = await uploadFileWithRetry(filePath, options);
    results.push({
      url: res.secure_url,
      public_id: res.public_id,
      resource_type: resourceType,
      original_name: filename
    });
  }

  return results;
}

async function processDocument(doc, index, total) {
  const docId = String(doc._id);
  const cat = doc.category;
  const title = (doc.title || 'Untitled').substring(0, 40);

  // Check if both paths already have valid cloudinary URLs
  let hasCoverCloudinary = false;
  let hasDocCloudinary = false;
  try {
    const c = JSON.parse(doc.cover_path);
    if (Array.isArray(c) && c.length > 0 && c[0].url && c[0].url.includes('cloudinary')) {
      hasCoverCloudinary = true;
    }
  } catch(e) {}
  try {
    const d = JSON.parse(doc.document_path);
    if (Array.isArray(d) && d.length > 0 && d[0].url && d[0].url.includes('cloudinary')) {
      hasDocCloudinary = true;
    }
  } catch(e) {}

  if (hasCoverCloudinary && hasDocCloudinary) {
    console.log(`[${index}/${total}] ${title} -> Already on Cloudinary, skipping.`);
    return;
  }

  console.log(`[${index}/${total}] Uploading ${title} (${cat}/${docId})...`);

  // Check if cover and document share the exact same physical file
  const coverDir = path.join(FILES_BASE, cat, docId, 'cover');
  const docDir = path.join(FILES_BASE, cat, docId, 'document');

  let coverFiles = [];
  let docFiles = [];

  const coverList = fs.existsSync(coverDir) ? fs.readdirSync(coverDir) : [];
  const docList = fs.existsSync(docDir) ? fs.readdirSync(docDir) : [];

  const isIdentical = (
    coverList.length > 0 &&
    docList.length > 0 &&
    coverList.length === docList.length &&
    coverList[0] === docList[0]
  );

  if (isIdentical && !hasDocCloudinary && !hasCoverCloudinary) {
    // Upload once, share results for both
    docFiles = await uploadFolderFiles(cat, docId, 'document');
    coverFiles = docFiles;
    console.log(`  -> Uploaded 1 shared file for both cover & document`);
  } else {
    if (!hasCoverCloudinary) {
      coverFiles = await uploadFolderFiles(cat, docId, 'cover');
    }
    if (!hasDocCloudinary) {
      docFiles = await uploadFolderFiles(cat, docId, 'document');
    }
  }

  let updated = false;
  if (!hasCoverCloudinary && coverFiles.length > 0) {
    doc.cover_path = JSON.stringify(coverFiles);
    updated = true;
  }
  if (!hasDocCloudinary && docFiles.length > 0) {
    doc.document_path = JSON.stringify(docFiles);
    updated = true;
  }

  if (updated) {
    await doc.save();
    console.log(`  -> Updated MongoDB with Cloudinary URLs.`);
  } else {
    console.log(`  -> No local files found to upload.`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('BULK CLOUDINARY UPLOAD & MONGODB SYNC');
  console.log('='.repeat(60));

  await mongoose.connect(process.env.DATABASE_STRING);
  console.log('Connected to MongoDB Atlas.');

  const docs = await Document.find({}).sort({ _id: 1 });
  console.log(`Total documents found in database: ${docs.length}`);

  const startTime = Date.now();
  let completed = 0;

  for (let i = 0; i < docs.length; i++) {
    try {
      await processDocument(docs[i], i + 1, docs.length);
      completed++;
    } catch (err) {
      console.error(`Error processing doc ${docs[i]._id}:`, err.message);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('='.repeat(60));
  console.log(`Finished in ${elapsed} minutes. Successfully processed: ${completed}/${docs.length}`);
  console.log('='.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
