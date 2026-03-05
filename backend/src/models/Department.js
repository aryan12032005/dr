const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  dep_code: {
    type: String,
    required: true,
    unique: true
  },
  dep_name: {
    type: String,
    required: true
  },
  managers: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  subjects: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema, 'departments');
