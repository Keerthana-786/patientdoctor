/**
 * AI Risk Engine — calculates a risk score (0–100) for each access attempt
 * Factors: role clearance, time of access, device fingerprint, data sensitivity, behavior
 */

const ROLE_CLEARANCE = {
  admin: 10,
  doctor: 20,
  nurse: 35,
  patient: 50
};

const SENSITIVITY_SCORE = {
  low: 5,
  medium: 15,
  high: 30,
  critical: 45
};

function calculateRiskScore({ role, sensitivityLevel, hour, loginCount, isNewDevice, actionType }) {
  let score = 0;

  // 1. Role clearance (lower role = higher risk for sensitive data)
  score += ROLE_CLEARANCE[role] || 50;

  // 2. Data sensitivity
  score += SENSITIVITY_SCORE[sensitivityLevel] || 15;

  // 3. Time-based risk: access outside 7am–9pm is riskier
  if (hour < 7 || hour > 21) {
    score += 15;
  } else if (hour < 9 || hour > 18) {
    score += 5;
  }

  // 4. Device fingerprint
  if (isNewDevice) {
    score += 20;
  }

  // 5. Behavior: excessive login attempts
  if (loginCount > 10) {
    score += 10;
  }

  // 6. Write/delete operations are riskier than reads
  if (actionType === 'delete') {
    score += 15;
  } else if (actionType === 'update') {
    score += 8;
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return Math.round(score);
}

function getAccessDecision(riskScore) {
  if (riskScore < 50) return 'granted';
  if (riskScore < 75) return 'step_up';
  return 'denied';
}

function getRiskLabel(riskScore) {
  if (riskScore < 30) return 'LOW';
  if (riskScore < 50) return 'MODERATE';
  if (riskScore < 75) return 'HIGH';
  return 'CRITICAL';
}

module.exports = { calculateRiskScore, getAccessDecision, getRiskLabel };
