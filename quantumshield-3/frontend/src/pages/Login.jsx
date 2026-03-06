import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login(form.username, form.password);
      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (username) => setForm({ username, password: 'demo1234' });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #1e1b4b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ color: '#e0e6ff', fontSize: '28px', fontWeight: 800, letterSpacing: '1px' }}>
            QuantumShield Health
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '13px', letterSpacing: '1px' }}>
            AI-POWERED QUANTUM-RESILIENT HEALTHCARE SECURITY
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ color: '#e0e6ff', fontSize: '20px', marginBottom: '24px', fontWeight: 700 }}>
            Secure Login
          </h2>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter username"
              style={{
                width: '100%',
                marginTop: '6px',
                background: '#0a0e1a',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#e0e6ff',
                padding: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter password"
              style={{
                width: '100%',
                marginTop: '6px',
                background: '#0a0e1a',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#e0e6ff',
                padding: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? '#1e3a5f'
                : 'linear-gradient(90deg, #2563eb, #7c3aed)',
              border: 'none',
              color: 'white',
              padding: '13px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '🔐 Authenticating...' : '🔐 Login Securely'}
          </button>

          {/* Demo Users */}
          <div style={{ marginTop: '28px' }}>
            <p style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Demo Users (click to fill)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: '👤 Patient', user: 'john.patient', color: '#10b981' },
                { label: '💊 Nurse', user: 'priya.nurse', color: '#f59e0b' },
                { label: '🩺 Doctor', user: 'raj.doctor', color: '#3b82f6' },
                { label: '⚙️ Admin', user: 'admin.secure', color: '#ef4444' }
              ].map(d => (
                <button
                  key={d.user}
                  onClick={() => fillDemo(d.user)}
                  style={{
                    background: `${d.color}15`,
                    border: `1px solid ${d.color}40`,
                    color: d.color,
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
