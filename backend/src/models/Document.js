const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  docType: {
    type: String,
    required: true
  },
  coverType: {
    type: String,
    default: ''
  },
  coverLink: {
    type: String,
    default: ''
  },
  cover_path: {
    type: String,
    default: ''
  },
  documentLink: {
    type: String,
    default: ''
  },
  document_path: {
    type: String,
    default: ''
  },
  isPublic: {
    type: String,
    default: 'true'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  allowed_users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  createDate: {
    type: String,
    default: () => new Date().toISOString()
  },
  category: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: ''
  },
  authors: {
    type: String,
    default: ''
  },
  accessionNumber: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create text index for search
documentSchema.index({ 
  title: 'text', 
  authors: 'text', 
  subject: 'text',
  accessionNumber: 'text'
});

module.exports = mongoose.model('Document', documentSchema, 'documents');
