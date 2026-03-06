const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authMiddleware } = require('../middleware/authMiddleware');
const { verifyChainIntegrity } = require('../utils/blockchain');

// GET /api/audit — get audit logs
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};

    // Patients only see their own logs
    if (req.user.role === 'patient') {
      query.userId = req.user._id;
    }

    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await AuditLog.countDocuments(query);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/audit/verify — verify blockchain chain integrity (admin only)
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const result = await verifyChainIntegrity();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/audit/stats — get audit statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (!['admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const totalLogs = await AuditLog.countDocuments();
    const granted = await AuditLog.countDocuments({ accessDecision: 'granted' });
    const denied = await AuditLog.countDocuments({ accessDecision: 'denied' });
    const stepUp = await AuditLog.countDocuments({ accessDecision: 'step_up' });
    const emergencies = await AuditLog.countDocuments({ action: 'EMERGENCY_OVERRIDE' });

    const avgRiskResult = await AuditLog.aggregate([
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
    ]);

    res.json({
      totalLogs,
      granted,
      denied,
      stepUp,
      emergencies,
      avgRiskScore: avgRiskResult[0]?.avgRisk?.toFixed(1) || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
