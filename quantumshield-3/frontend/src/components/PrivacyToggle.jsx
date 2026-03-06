import React, { useState } from 'react';
import api from '../utils/api';

export default function PrivacyToggle({ recordId, isPrivate: initialPrivate, onToggle }) {
  const [isPrivate, setIsPrivate] = useState(initialPrivate);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/records/${recordId}/privacy`);
      setIsPrivate(res.data.isPrivate);
      onToggle && onToggle(res.data.isPrivate);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle privacy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isPrivate ? 'Make public' : 'Make private'}
      style={{
        background: isPrivate ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
        border: `1px solid ${isPrivate ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
        color: isPrivate ? '#f87171' : '#34d399',
        padding: '4px 12px',
        borderRadius: '20px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1
      }}
    >
      {loading ? '...' : isPrivate ? '🔒 Private' : '🌐 Public'}
    </button>
  );
}
