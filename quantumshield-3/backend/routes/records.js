const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const { authMiddleware } = require('../middleware/authMiddleware');
const { calculateRiskScore, getAccessDecision } = require('../utils/riskEngine');
const { createAuditBlock } = require('../utils/blockchain');
const AuditLog = require('../models/AuditLog');

// Helper to log access
async function logAccess(req, recordSensitivity, action, resourceId, decision, riskScore) {
  try {
    const { blockHash, previousHash, blockIndex } = await createAuditBlock({
      userId: req.user._id,
      action,
      resourceId,
      riskScore,
      decision
    });
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      userRole: req.user.role,
      action,
      resourceType: 'HealthRecord',
      resourceId,
      riskScore,
      accessDecision: decision,
      ipAddress: req.ip,
      deviceFingerprint: req.headers['user-agent'],
      blockHash,
      previousHash,
      blockIndex
    });
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
}

// GET /api/records — get all accessible records
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
      query.isPrivate = false;
    } else if (req.user.role === 'nurse') {
      query.sensitivityLevel = { $in: ['low', 'medium'] };
    }
    // doctors and admins see all

    const records = await HealthRecord.find(query).sort({ createdAt: -1 });
    res.json({ records, count: records.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/records/:id — get single record with risk check
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    const hour = new Date().getHours();
    const riskScore = calculateRiskScore({
      role: req.user.role,
      sensitivityLevel: record.sensitivityLevel,
      hour,
      loginCount: req.user.loginCount,
      isNewDevice: false,
      actionType: 'read'
    });

    const decision = getAccessDecision(riskScore);

    await logAccess(req, record.sensitivityLevel, 'VIEW_RECORD', record._id.toString(), decision, riskScore);

    if (decision === 'denied') {
      return res.status(403).json({ message: 'Access denied by AI Risk Engine.', riskScore, decision });
    }

    res.json({ record, riskScore, decision });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/records — create new record (doctor/admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only doctors or admins can create records.' });
    }

    const { patientId, patientName, recordType, title, description, sensitivityLevel, data, isPrivate, tags } = req.body;

    const record = await HealthRecord.create({
      patientId,
      patientName,
      recordType,
      title,
      description,
      sensitivityLevel: sensitivityLevel || 'medium',
      data: data || {},
      isPrivate: isPrivate || false,
      tags: tags || [],
      createdBy: req.user._id,
      createdByName: req.user.fullName,
      createdByRole: req.user.role
    });

    await logAccess(req, sensitivityLevel, 'CREATE_RECORD', record._id.toString(), 'granted', 10);

    res.status(201).json({ message: 'Record created.', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/records/:id — update record
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only doctors or admins can update records.' });
    }

    const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    await logAccess(req, record.sensitivityLevel, 'UPDATE_RECORD', record._id.toString(), 'granted', 20);

    res.json({ message: 'Record updated.', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/records/:id — delete record (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete records.' });
    }

    const record = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    await logAccess(req, record.sensitivityLevel, 'DELETE_RECORD', req.params.id, 'granted', 5);

    res.json({ message: 'Record deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/records/:id/privacy — toggle privacy
router.put('/:id/privacy', authMiddleware, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    const canToggle =
      req.user.role === 'admin' ||
      req.user.role === 'doctor' ||
      record.patientId.toString() === req.user._id.toString();

    if (!canToggle) return res.status(403).json({ message: 'Not authorized to toggle privacy.' });

    record.isPrivate = !record.isPrivate;
    await record.save();

    res.json({ message: `Record is now ${record.isPrivate ? 'private' : 'public'}.`, isPrivate: record.isPrivate });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
