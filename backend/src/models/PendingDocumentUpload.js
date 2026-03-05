const mongoose = require('mongoose');

const pendingDocumentUploadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  authors: {
    type: String,
    default: ''
  },
  docType: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: ''
  },
  accessionNumber: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  comments: {
    type: [String],
    default: []
  },
  fileName: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  coverType: {
    type: String,
    default: 'none'
  },
  coverLink: {
    type: String,
    default: ''
  },
  coverFileName: {
    type: String,
    default: ''
  },
  coverPath: {
    type: String,
    default: ''
  },
  faculty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  faculty_name: {
    type: String,
    required: true
  },
  faculty_email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PendingDocumentUpload', pendingDocumentUploadSchema, 'pending_document_uploads');
