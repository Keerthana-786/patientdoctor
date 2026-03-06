import React from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  patient: '#10b981',
  nurse: '#f59e0b',
  doctor: '#3b82f6',
  admin: '#ef4444'
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)',
      borderBottom: '1px solid #1e3a5f',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🛡️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#e0e6ff', letterSpacing: '0.5px' }}>
            QuantumShield Health
          </div>
          <div style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>
            AI-Powered Security Platform
          </div>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#e0e6ff', fontWeight: 600 }}>
              {user.fullName}
            </div>
            <div style={{
              fontSize: '11px',
              color: ROLE_COLORS[user.role] || '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 700
            }}>
              {user.role}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#f87171',
              padding: '6px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.3)'}
            onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
