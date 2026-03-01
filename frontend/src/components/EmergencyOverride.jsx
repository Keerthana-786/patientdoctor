import React, { useState } from 'react';
import api from '../utils/api';

const S = {
  panel: { background:'linear-gradient(135deg,rgba(244,63,94,.08),rgba(251,146,60,.05))', border:'1px solid rgba(244,63,94,.3)', borderRadius:6, padding:'1.5rem', marginTop:'1.5rem' },
  title: { fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700, color:'var(--danger)', marginBottom:'.4rem' },
  desc: { fontSize:'.7rem', color:'var(--muted2)', marginBottom:'1rem', lineHeight:1.7 },
  label: { fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:'.4rem', display:'block' },
  input: { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'JetBrains Mono,monospace', fontSize:'.75rem', padding:'.65rem .9rem', borderRadius:3, outline:'none', marginBottom:'1rem' },
  btn: { width:'100%', padding:'.75rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.72rem', letterSpacing:'.08em', textTransform:'uppercase', border:'none', background:'var(--danger)', color:'#fff', fontWeight:700, cursor:'pointer', borderRadius:3 },
  success: { background:'rgba(244,63,94,.1)', border:'1px solid var(--danger)', borderRadius:4, padding:'1rem', marginTop:'1rem', fontSize:'.72rem', lineHeight:1.7 },
};

export default function EmergencyOverride({ patients = [], onSuccess }) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reason, setReason]                   = useState('');
  const [loading, setLoading]                 = useState(false);
  const [result, setResult]                   = useState(null);

  const handleOverride = async () => {
    if (!selectedPatient || !reason.trim()) return;
    setLoading(true);
    try {
      const patient = patients.find(p => p._id === selectedPatient);
      const { data } = await api.post('/access/emergency', {
        patientId: selectedPatient,
        patientName: patient?.name || selectedPatient,
        reason,
      });
      setResult(data);
      onSuccess && onSuccess(data);
      setSelectedPatient('');
      setReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error activating override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.panel}>
      <div style={S.title}>⚡ Emergency Override — Break-Glass</div>
      <div style={S.desc}>For life-critical emergencies only. All overrides are logged immutably to the blockchain and flagged for compliance review.</div>

      <label style={S.label}>Select Patient</label>
      <select style={{ ...S.input }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
        <option value="">Choose patient...</option>
        {patients.map(p => (
          <option key={p._id} value={p._id}>{p.name} — {p.patientId || p._id.toString().slice(-6)}</option>
        ))}
      </select>

      <label style={S.label}>Emergency Reason</label>
      <input style={S.input} type="text" placeholder="e.g. Cardiac arrest, patient unconscious" value={reason} onChange={e => setReason(e.target.value)} />

      <button style={{ ...S.btn, opacity: loading || !selectedPatient || !reason ? .5 : 1 }} onClick={handleOverride} disabled={loading || !selectedPatient || !reason}>
        {loading ? 'Activating...' : '🚨 Activate Emergency Override'}
      </button>

      {result && (
        <div style={S.success}>
          <div style={{ color:'var(--danger)', fontWeight:700, marginBottom:'.3rem' }}>🚨 Override Activated</div>
          <div style={{ color:'var(--muted2)' }}>Block #{result.blockIndex} &nbsp;·&nbsp; Logged to blockchain</div>
          <div style={{ color:'var(--muted)', fontSize:'.58rem', marginTop:'.3rem' }}>Hash: {result.blockHash?.substring(0,40)}...</div>
        </div>
      )}
    </div>
  );
}
