const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  group_name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  documents: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, {
  timestamps: true
});

// Create text index for search
groupSchema.index({ group_name: 'text' });

module.exports = mongoose.model('Group', groupSchema, 'groups');
