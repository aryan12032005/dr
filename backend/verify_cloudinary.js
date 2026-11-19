const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.DATABASE_STRING);
  const Document = require('./src/models/Document');
  const total = await Document.countDocuments({});
  const withDocCloud = await Document.countDocuments({ document_path: { $regex: 'cloudinary' } });
  const withCoverCloud = await Document.countDocuments({ cover_path: { $regex: 'cloudinary' } });

  console.log('Total documents:', total);
  console.log('Documents with Cloudinary document_path:', withDocCloud);
  console.log('Documents with Cloudinary cover_path:', withCoverCloud);

  const sample = await Document.findOne({ document_path: { $regex: 'cloudinary' } });
  if (sample) {
    console.log('\nSample Document:');
    console.log('ID:', sample._id);
    console.log('Title:', sample.title);
    console.log('Category:', sample.category);
    console.log('Cover URL:', JSON.parse(sample.cover_path)[0]?.url);
    console.log('Doc URL:', JSON.parse(sample.document_path)[0]?.url);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
