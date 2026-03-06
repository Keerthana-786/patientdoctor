const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  recordType: {
    type: String,
    enum: ['diagnosis', 'prescription', 'lab_result', 'vital_signs', 'surgery', 'allergy', 'vaccination'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sensitivityLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: String,
  createdByRole: String,
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
