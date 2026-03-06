import React, { useState } from 'react';
import api from '../utils/api';

export default function EmergencyOverride({ onSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOverride = async () => {
    if (!reason.trim()) return alert('Please provide an emergency reason.');
    setLoading(true);
    try {
      const res = await api.post('/access/emergency', { reason });
      setResult(res.data);
      onSuccess && onSuccess();
    } catch (err) {
      setResult({ message: err.response?.data?.message || 'Override failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.5)',
          color: '#f87171',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px'
        }}
      >
        🚨 Emergency Override
      </button>

      {open && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>
            ⚠️ Emergency access bypasses risk controls. All activity is logged.
          </p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for emergency access..."
            rows={3}
            style={{
              width: '100%',
              background: '#0a0e1a',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#e0e6ff',
              padding: '10px',
              fontSize: '13px',
              resize: 'vertical',
              marginBottom: '12px'
            }}
          />
          <button
            onClick={handleOverride}
            disabled={loading}
            style={{
              background: '#ef4444',
              border: 'none',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Activating...' : 'Activate Override'}
          </button>

          {result && (
            <div style={{
              marginTop: '12px',
              color: result.decision === 'granted' ? '#10b981' : '#f87171',
              fontSize: '14px'
            }}>
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
