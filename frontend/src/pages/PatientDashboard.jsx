import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PrivacyToggle from '../components/PrivacyToggle';
import AuditTable from '../components/AuditTable';

const S = {
  wrap: { maxWidth:1200, margin:'0 auto', padding:'80px 1.5rem 3rem' },
  title: { fontFamily:'Syne,sans-serif', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-1px', marginBottom:'.25rem' },
  sub: { fontSize:'.72rem', color:'var(--muted2)', marginBottom:'2rem' },
  statRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' },
  statCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:'1.25rem 1.5rem' },
  statNum: { fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, lineHeight:1 },
  statLabel: { fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted2)', marginTop:'.3rem' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' },
  sectionHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--border)' },
  sectionTitle: { fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700 },
  chip: { fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--accent)', background:'var(--accent-dim)', padding:'.2rem .6rem', borderRadius:2 },
  card: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:'0', overflow:'hidden' },
  encBanner: { background:'var(--accent-dim)', border:'1px solid var(--accent)', borderRadius:4, padding:'1rem', marginTop:'1rem', fontSize:'.65rem', lineHeight:1.7, color:'var(--muted2)' },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, logRes] = await Promise.all([
          api.get('/records'),
          api.get('/audit'),
        ]);
        setRecords(recRes.data);
        setLogs(logRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshLogs = async () => {
    const res = await api.get('/audit');
    setLogs(res.data);
  };

  const lockedCount = records.filter(r => r.isLocked).length;

  if (loading) return <div style={{ padding:'5rem 2rem', color:'var(--accent)', fontFamily:'JetBrains Mono,monospace' }}>Loading records...</div>;

  return (
    <div style={S.wrap}>
      <div style={S.title}>Patient Portal</div>
      <div style={S.sub}>Welcome, {user.name} — manage your health records and privacy</div>

      <div style={S.statRow}>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--accent)' }}>{records.length}</div><div style={S.statLabel}>Total Records</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--danger)' }}>{lockedCount}</div><div style={S.statLabel}>Locked Records</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--purple)' }}>{logs.length}</div><div style={S.statLabel}>Access Events</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--accent)' }}>✓</div><div style={S.statLabel}>Quantum Encrypted</div></div>
      </div>

      <div style={S.grid}>
        <div>
          <div style={S.sectionHead}>
            <div style={S.sectionTitle}>Your Health Records</div>
            <div style={S.chip}>Privacy Controls</div>
          </div>
          {records.length === 0 && <div style={{ color:'var(--muted2)', fontSize:'.75rem' }}>No records found.</div>}
          {records.map(r => (
            <PrivacyToggle key={r._id} record={r} onUpdate={() => refreshLogs()} />
          ))}
          <div style={S.encBanner}>
            <div style={{ color:'var(--accent)', fontWeight:700, marginBottom:'.3rem' }}>🛡️ Post-Quantum Encrypted</div>
            All data secured with CRYSTALS-Kyber PQC. Every access is immutably logged on the blockchain.
          </div>
        </div>

        <div>
          <div style={S.sectionHead}>
            <div style={S.sectionTitle}>Who Accessed My Data</div>
            <div style={S.chip}>Live Audit Trail</div>
          </div>
          <div style={S.card}>
            <AuditTable logs={logs} columns="simple" />
          </div>
        </div>
      </div>
    </div>
  );
}
