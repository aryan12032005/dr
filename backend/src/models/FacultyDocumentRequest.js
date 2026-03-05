const mongoose = require('mongoose');

const facultyDocumentRequestSchema = new mongoose.Schema({
  doc_id: {
    type: String,
    required: true
  },
  fac_id: {
    type: Number,
    required: true
  },
  requester_id: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FacultyDocumentRequest', facultyDocumentRequestSchema, 'faculty_document_requests');
