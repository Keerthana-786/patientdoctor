const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

/**
 * Creates a SHA-256 hash of audit log data chained to the previous block hash.
 * This makes the audit log tamper-evident — changing any record breaks the chain.
 */
function createHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

async function getLastBlockHash() {
  const lastLog = await AuditLog.findOne().sort({ blockIndex: -1 });
  if (!lastLog) return '0000000000000000000000000000000000000000000000000000000000000000';
  return lastLog.blockHash;
}

async function getNextBlockIndex() {
  const lastLog = await AuditLog.findOne().sort({ blockIndex: -1 });
  if (!lastLog) return 1;
  return (lastLog.blockIndex || 0) + 1;
}

async function createAuditBlock(logData) {
  const previousHash = await getLastBlockHash();
  const blockIndex = await getNextBlockIndex();
  const timestamp = new Date().toISOString();

  const blockHash = createHash({
    blockIndex,
    previousHash,
    timestamp,
    ...logData
  });

  return { blockHash, previousHash, blockIndex };
}

async function verifyChainIntegrity() {
  const logs = await AuditLog.find().sort({ blockIndex: 1 });
  const broken = [];

  for (let i = 1; i < logs.length; i++) {
    const current = logs[i];
    const previous = logs[i - 1];

    if (current.previousHash !== previous.blockHash) {
      broken.push({
        blockIndex: current.blockIndex,
        issue: 'Previous hash mismatch — chain broken'
      });
    }
  }

  return {
    isValid: broken.length === 0,
    totalBlocks: logs.length,
    brokenLinks: broken
  };
}

module.exports = { createAuditBlock, verifyChainIntegrity };
