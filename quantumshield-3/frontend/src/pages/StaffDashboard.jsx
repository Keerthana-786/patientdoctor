import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AuditTable from '../components/AuditTable';
import RiskModal from '../components/RiskModal';
import EmergencyOverride from '../components/EmergencyOverride';
import PrivacyToggle from '../components/PrivacyToggle';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SENSITIVITY_COLOR = {
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#9333ea'
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab, setTab] = useState('records');
  const [loading, setLoading] = useState(true);
  const [riskModal, setRiskModal] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    patientId: '', patientName: '', recordType: 'diagnosis',
    title: '', description: '', sensitivityLevel: 'medium', isPrivate: false
  });
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchRecords();
    fetchAuditLogs();
    if (user.role === 'doctor') fetchPatients();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records');
      setRecords(res.data.records);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit');
      setAuditLogs(res.data.logs);
    } catch (err) { console.error(err); }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/auth/users');
      setPatients(res.data.users.filter(u => u.role === 'patient'));
    } catch (err) { console.error(err); }
  };

  const handleViewRecord = async (record) => {
    try {
      const res = await api.post('/access/evaluate', {
        sensitivityLevel: record.sensitivityLevel,
        actionType: 'read',
        resourceId: record._id
      });
      setRiskModal({ ...res.data, record });
    } catch (err) {
      alert(err.response?.data?.message || 'Evaluation failed.');
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.patientName) {
      return alert('Please fill all required fields.');
    }
    try {
      await api.post('/records', form);
      setShowCreate(false);
      setForm({ patientId: '', patientName: '', recordType: 'diagnosis', title: '', description: '', sensitivityLevel: 'medium', isPrivate: false });
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed.');
    }
  };

  const inputStyle = {
    width: '100%', background: '#0a0e1a', border: '1px solid #374151',
    borderRadius: '6px', color: '#e0e6ff', padding: '10px', fontSize: '13px', outline: 'none'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          border: '1px solid #1e3a5f', borderRadius: '12px',
          padding: '24px', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <h1 style={{ color: '#e0e6ff', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              {user.role === 'doctor' ? '🩺' : '💊'} {user?.fullName}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              {user.role === 'doctor' ? 'Full record access · Can create & edit records' : 'Limited to low/medium sensitivity records'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {user.role === 'doctor' && (
              <button
                onClick={() => setShowCreate(!showCreate)}
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#60a5fa',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                + New Record
              </button>
            )}
            <EmergencyOverride onSuccess={fetchRecords} />
          </div>
        </div>

        {/* Create Record Form */}
        {showCreate && user.role === 'doctor' && (
          <div style={{
            background: '#111827', border: '1px solid #1e3a5f',
            borderRadius: '12px', padding: '24px', marginBottom: '24px'
          }}>
            <h3 style={{ color: '#e0e6ff', marginBottom: '20px', fontSize: '16px' }}>📝 Create New Health Record</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Patient Name *</label>
                <input style={{ ...inputStyle, marginTop: '6px' }} value={form.patientName}
                  onChange={e => setForm({ ...form, patientName: e.target.value })} placeholder="Patient name" />
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Record Type *</label>
                <select style={{ ...inputStyle, marginTop: '6px' }} value={form.recordType}
                  onChange={e => setForm({ ...form, recordType: e.target.value })}>
                  {['diagnosis','prescription','lab_result','vital_signs','surgery','allergy','vaccination'].map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Title *</label>
                <input style={{ ...inputStyle, marginTop: '6px' }} value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Record title" />
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Sensitivity</label>
                <select style={{ ...inputStyle, marginTop: '6px' }} value={form.sensitivityLevel}
                  onChange={e => setForm({ ...form, sensitivityLevel: e.target.value })}>
                  {['low','medium','high','critical'].map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase' }}>Description *</label>
                <textarea rows={3} style={{ ...inputStyle, marginTop: '6px', resize: 'vertical' }}
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed notes..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={handleCreate} style={{
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)', border: 'none', color: 'white',
                padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700
              }}>Create Record</button>
              <button onClick={() => setShowCreate(false)} style={{
                background: 'rgba(107,114,128,0.2)', border: '1px solid #374151', color: '#9ca3af',
                padding: '10px 20px', borderRadius: '6px', cursor: 'pointer'
              }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { key: 'records', label: '📋 All Records' },
            { key: 'audit', label: '🔍 Audit Logs' }
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

        {/* Records Tab */}
        {tab === 'records' && (
          <div>
            {loading ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Loading records...</div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {records.map(record => (
                  <div key={record._id} style={{
                    background: '#111827', border: '1px solid #1e3a5f',
                    borderRadius: '12px', padding: '18px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#e0e6ff', fontWeight: 700 }}>{record.title}</span>
                          <span style={{
                            background: `${SENSITIVITY_COLOR[record.sensitivityLevel]}20`,
                            color: SENSITIVITY_COLOR[record.sensitivityLevel],
                            padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700
                          }}>{record.sensitivityLevel?.toUpperCase()}</span>
                        </div>
                        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '6px' }}>{record.description}</p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>
                          Patient: <span style={{ color: '#60a5fa' }}>{record.patientName}</span> · {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <PrivacyToggle recordId={record._id} isPrivate={record.isPrivate} onToggle={fetchRecords} />
                        <button onClick={() => handleViewRecord(record)} style={{
                          background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)',
                          color: '#60a5fa', padding: '6px 14px', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 600
                        }}>🔍 Risk Check</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'audit' && (
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e3a5f' }}>
              <h2 style={{ color: '#e0e6ff', fontSize: '16px', fontWeight: 700 }}>Audit Logs</h2>
            </div>
            <AuditTable logs={auditLogs} />
          </div>
        )}
      </div>

      <RiskModal riskData={riskModal} onClose={() => setRiskModal(null)} onConfirm={() => setRiskModal(null)} />
    </div>
  );
}
