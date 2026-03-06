import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AuditTable from '../components/AuditTable';
import api from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, auditRes] = await Promise.all([
        api.get('/audit/stats'),
        api.get('/auth/users'),
        api.get('/audit?limit=100')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setAuditLogs(auditRes.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    try {
      const res = await api.get('/audit/verify');
      setChainStatus(res.data);
    } catch (err) {
      alert('Chain verification failed.');
    }
  };

  const toggleUser = async (userId) => {
    try {
      await api.put(`/auth/users/${userId}/toggle`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Toggle failed.');
    }
  };

  const ROLE_COLOR = { patient: '#10b981', nurse: '#f59e0b', doctor: '#3b82f6', admin: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e, #0f172a)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px', padding: '24px', marginBottom: '24px'
        }}>
          <h1 style={{ color: '#e0e6ff', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
            ⚙️ Admin Control Center
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Full system access · Manage users, audit logs, and blockchain integrity
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Logs', value: stats.totalLogs, color: '#3b82f6', icon: '📊' },
              { label: 'Granted', value: stats.granted, color: '#10b981', icon: '✅' },
              { label: 'Denied', value: stats.denied, color: '#ef4444', icon: '🚫' },
              { label: 'Step-Up', value: stats.stepUp, color: '#f59e0b', icon: '⚠️' },
              { label: 'Emergency', value: stats.emergencies, color: '#9333ea', icon: '🚨' },
              { label: 'Avg Risk', value: stats.avgRiskScore, color: '#60a5fa', icon: '🎯' }
            ].map(s => (
              <div key={s.label} style={{
                background: '#111827', border: `1px solid ${s.color}30`,
                borderRadius: '12px', padding: '20px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ color: s.color, fontSize: '28px', fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'users', label: '👥 Users' },
            { key: 'audit', label: '🔍 Full Audit Log' },
            { key: 'blockchain', label: '⛓️ Blockchain' }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 20px', borderRadius: '8px',
              border: tab === t.key ? '1px solid #3b82f6' : '1px solid #374151',
              background: tab === t.key ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: tab === t.key ? '#60a5fa' : '#9ca3af',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: '#e0e6ff', fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>
              Recent Activity
            </h2>
            <AuditTable logs={auditLogs.slice(0, 10)} />
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e3a5f' }}>
              <h2 style={{ color: '#e0e6ff', fontSize: '16px', fontWeight: 700 }}>User Management</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
                    {['Name', 'Username', 'Email', 'Role', 'Logins', 'Status', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', color: '#6b7280',
                        fontWeight: 600, fontSize: '11px', textTransform: 'uppercase'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '12px 16px', color: '#e0e6ff', fontWeight: 600 }}>{u.fullName}</td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{u.username}</td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          color: ROLE_COLOR[u.role], background: `${ROLE_COLOR[u.role]}20`,
                          padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{u.loginCount || 0}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          color: u.isActive ? '#10b981' : '#6b7280',
                          background: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                          padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700
                        }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => toggleUser(u._id)} style={{
                          background: u.isActive ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                          border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                          color: u.isActive ? '#f87171' : '#34d399',
                          padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600
                        }}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {tab === 'audit' && (
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e3a5f' }}>
              <h2 style={{ color: '#e0e6ff', fontSize: '16px', fontWeight: 700 }}>Full Blockchain Audit Log</h2>
            </div>
            <AuditTable logs={auditLogs} />
          </div>
        )}

        {/* Blockchain Tab */}
        {tab === 'blockchain' && (
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ color: '#e0e6ff', fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>
              ⛓️ Blockchain Integrity Verification
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>
              Each audit log entry is cryptographically linked to the previous one using SHA-256 hashing.
              Verifying the chain detects any tampering with historical records.
            </p>
            <button
              onClick={verifyChain}
              style={{
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                border: 'none', color: 'white',
                padding: '12px 28px', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px', marginBottom: '20px'
              }}
            >
              🔍 Verify Chain Integrity
            </button>

            {chainStatus && (
              <div style={{
                background: chainStatus.isValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${chainStatus.isValid ? '#10b981' : '#ef4444'}40`,
                borderRadius: '10px', padding: '20px'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: chainStatus.isValid ? '#10b981' : '#ef4444', marginBottom: '10px' }}>
                  {chainStatus.isValid ? '✅ Chain Integrity Valid' : '🚫 Chain Integrity BROKEN'}
                </div>
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Total blocks verified: <strong style={{ color: '#e0e6ff' }}>{chainStatus.totalBlocks}</strong>
                </p>
                {chainStatus.brokenLinks?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px' }}>Broken links:</p>
                    {chainStatus.brokenLinks.map((b, i) => (
                      <div key={i} style={{ color: '#f87171', fontSize: '12px', fontFamily: 'monospace' }}>
                        Block #{b.blockIndex}: {b.issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
