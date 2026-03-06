import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AuditTable from '../components/AuditTable';
import PrivacyToggle from '../components/PrivacyToggle';
import RiskModal from '../components/RiskModal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SENSITIVITY_COLOR = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#9333ea'
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab, setTab] = useState('records');
  const [loading, setLoading] = useState(true);
  const [riskModal, setRiskModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
    fetchAuditLogs();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records');
      setRecords(res.data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit');
      setAuditLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    }
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
      alert(err.response?.data?.message || 'Access evaluation failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h1 style={{ color: '#e0e6ff', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
            Welcome, {user?.fullName} 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Your secure health portal — all access monitored by AI Risk Engine
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { key: 'records', label: '📋 My Records' },
            { key: 'audit', label: '🔍 Access Logs' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: tab === t.key ? '1px solid #3b82f6' : '1px solid #374151',
                background: tab === t.key ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: tab === t.key ? '#60a5fa' : '#9ca3af',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Records Tab */}
        {tab === 'records' && (
          <div>
            {loading ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Loading records...</div>
            ) : records.length === 0 ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>No health records found.</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {records.map(record => (
                  <div key={record._id} style={{
                    background: '#111827',
                    border: '1px solid #1e3a5f',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ color: '#e0e6ff', fontSize: '16px', fontWeight: 700 }}>{record.title}</h3>
                          <span style={{
                            background: `${SENSITIVITY_COLOR[record.sensitivityLevel]}20`,
                            color: SENSITIVITY_COLOR[record.sensitivityLevel],
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {record.sensitivityLevel}
                          </span>
                          <span style={{
                            background: 'rgba(96,165,250,0.1)',
                            color: '#60a5fa',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px'
                          }}>
                            {record.recordType?.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>
                          {record.description}
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>
                          Created by {record.createdByName} · {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <PrivacyToggle
                          recordId={record._id}
                          isPrivate={record.isPrivate}
                          onToggle={() => fetchRecords()}
                        />
                        <button
                          onClick={() => handleViewRecord(record)}
                          style={{
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.4)',
                            color: '#60a5fa',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          🔍 View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {tab === 'audit' && (
          <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e3a5f' }}>
              <h2 style={{ color: '#e0e6ff', fontSize: '16px', fontWeight: 700 }}>Your Access Logs</h2>
            </div>
            <AuditTable logs={auditLogs} />
          </div>
        )}
      </div>

      {/* Risk Modal */}
      <RiskModal
        riskData={riskModal}
        onClose={() => setRiskModal(null)}
        onConfirm={() => {
          if (riskModal?.record) setSelectedRecord(riskModal.record);
          setRiskModal(null);
        }}
      />
    </div>
  );
}
