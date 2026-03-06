const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  userRole: String,
  action: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    required: true
  },
  resourceId: String,
  riskScore: {
    type: Number,
    default: 0
  },
  accessDecision: {
    type: String,
    enum: ['granted', 'denied', 'step_up'],
    required: true
  },
  ipAddress: String,
  deviceFingerprint: String,
  blockHash: String,
  previousHash: String,
  blockIndex: Number,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
