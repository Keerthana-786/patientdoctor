import React from 'react';

export default function RiskModal({ riskData, onClose, onConfirm }) {
  if (!riskData) return null;

  const { riskScore, riskLabel, decision, message } = riskData;

  const color = decision === 'granted' ? '#10b981'
    : decision === 'step_up' ? '#f59e0b'
    : '#ef4444';

  const bgColor = decision === 'granted' ? 'rgba(16,185,129,0.1)'
    : decision === 'step_up' ? 'rgba(245,158,11,0.1)'
    : 'rgba(239,68,68,0.1)';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#111827',
        border: `1px solid ${color}`,
        borderRadius: '12px',
        padding: '32px',
        width: '400px',
        boxShadow: `0 0 40px ${color}30`
      }}>
        <h2 style={{ color, fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>
          🔐 AI Risk Assessment
        </h2>

        <div style={{
          background: bgColor,
          border: `1px solid ${color}40`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color }}>
            {riskScore}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Risk Score / 100</div>
          <div style={{
            marginTop: '8px',
            padding: '4px 12px',
            background: `${color}20`,
            borderRadius: '20px',
            display: 'inline-block',
            color,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '1px'
          }}>
            {riskLabel} RISK
          </div>
        </div>

        <p style={{ color: '#e0e6ff', textAlign: 'center', marginBottom: '24px', fontSize: '15px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          {decision !== 'denied' && (
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '10px',
                background: `${color}20`,
                border: `1px solid ${color}`,
                color,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Proceed
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(107,114,128,0.2)',
              border: '1px solid rgba(107,114,128,0.4)',
              color: '#9ca3af',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
