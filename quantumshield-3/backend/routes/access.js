const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { calculateRiskScore, getAccessDecision, getRiskLabel } = require('../utils/riskEngine');
const { createAuditBlock } = require('../utils/blockchain');
const AuditLog = require('../models/AuditLog');

// POST /api/access/evaluate — evaluate risk for an access attempt
router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const { sensitivityLevel, actionType, resourceId } = req.body;
    const hour = new Date().getHours();

    const riskScore = calculateRiskScore({
      role: req.user.role,
      sensitivityLevel: sensitivityLevel || 'medium',
      hour,
      loginCount: req.user.loginCount || 0,
      isNewDevice: false,
      actionType: actionType || 'read'
    });

    const decision = getAccessDecision(riskScore);
    const riskLabel = getRiskLabel(riskScore);

    // Create blockchain audit block
    const { blockHash, previousHash, blockIndex } = await createAuditBlock({
      userId: req.user._id,
      action: `EVALUATE_${actionType?.toUpperCase() || 'READ'}`,
      resourceId,
      riskScore,
      decision
    });

    // Save audit log
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      userRole: req.user.role,
      action: `EVALUATE_${actionType?.toUpperCase() || 'READ'}`,
      resourceType: 'AccessEvaluation',
      resourceId: resourceId || 'N/A',
      riskScore,
      accessDecision: decision,
      ipAddress: req.ip,
      deviceFingerprint: req.headers['user-agent'],
      blockHash,
      previousHash,
      blockIndex,
      metadata: { sensitivityLevel, actionType, hour }
    });

    res.json({
      riskScore,
      riskLabel,
      decision,
      message: decision === 'granted'
        ? '✅ Access Granted'
        : decision === 'step_up'
        ? '⚠️ Step-Up Authentication Required'
        : '🚫 Access Denied'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/access/emergency — emergency override (doctor/admin only)
router.post('/emergency', authMiddleware, async (req, res) => {
  try {
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Emergency override requires doctor or admin role.' });
    }

    const { reason, resourceId } = req.body;

    const { blockHash, previousHash, blockIndex } = await createAuditBlock({
      userId: req.user._id,
      action: 'EMERGENCY_OVERRIDE',
      resourceId,
      riskScore: 0,
      decision: 'granted'
    });

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'EMERGENCY_OVERRIDE',
      resourceType: 'EmergencyAccess',
      resourceId: resourceId || 'ALL',
      riskScore: 0,
      accessDecision: 'granted',
      ipAddress: req.ip,
      deviceFingerprint: req.headers['user-agent'],
      blockHash,
      previousHash,
      blockIndex,
      metadata: { reason }
    });

    res.json({
      message: '🚨 Emergency override activated.',
      decision: 'granted',
      riskScore: 0,
      reason
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
