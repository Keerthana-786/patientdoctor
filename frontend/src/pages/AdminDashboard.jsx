import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AuditTable from '../components/AuditTable';
import RiskModal from '../components/RiskModal';

const roleColor = { patient:'var(--blue)', nurse:'var(--accent)', doctor:'var(--purple)', admin:'var(--warn)' };
const roleTag = (role) => ({
  display:'inline-block', padding:'.2rem .6rem', borderRadius:3, fontSize:'.6rem',
  letterSpacing:'.08em', textTransform:'uppercase',
  background:`${roleColor[role] || 'var(--muted)'}22`,
  color: roleColor[role] || 'var(--muted2)',
});

const S = {
  wrap: { maxWidth:1200, margin:'0 auto', padding:'80px 1.5rem 3rem' },
  title: { fontFamily:'Syne,sans-serif', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-1px', marginBottom:'.25rem' },
  sub: { fontSize:'.72rem', color:'var(--muted2)', marginBottom:'2rem' },
  statRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' },
  statCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:'1.25rem 1.5rem' },
  statNum: { fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, lineHeight:1 },
  statLabel: { fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted2)', marginTop:'.3rem' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'1.5rem' },
  sectionHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--border)' },
  sectionTitle: { fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700 },
  chip: { fontSize:'.6rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--accent)', background:'var(--accent-dim)', padding:'.2rem .6rem', borderRadius:2 },
  userRow: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:5, padding:'.9rem 1.25rem', marginBottom:'.6rem', display:'flex', alignItems:'center', justifyContent:'space-between' },
  uName: { fontSize:'.8rem', fontWeight:700 },
  uMeta: { fontSize:'.62rem', color:'var(--muted2)', marginTop:'.1rem' },
  btn: { padding:'.35rem .8rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.6rem', letterSpacing:'.08em', textTransform:'uppercase', border:'1px solid var(--border2)', background:'transparent', color:'var(--text)', cursor:'pointer', borderRadius:3 },
  card: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:0, overflow:'hidden' },
  verifyBox: { marginTop:'1rem', background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:'1rem' },
};

export default function AdminDashboard() {
  const [users, setUsers]         = useState([]);
  const [logs, setLogs]           = useState([]);
  const [stats, setStats]         = useState({});
  const [chainResult, setChainResult] = useState(null);
  const [riskModal, setRiskModal] = useState({ open:false, user:null });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, logsRes, statsRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/audit/all'),
          api.get('/audit/stats'),
        ]);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
        setStats(statsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const verifyChain = async () => {
    try {
      const { data } = await api.get('/audit/verify');
      setChainResult(data);
    } catch (err) { alert('Verification error'); }
  };

  const refreshLogs = async () => {
    const [logsRes, statsRes] = await Promise.all([api.get('/audit/all'), api.get('/audit/stats')]);
    setLogs(logsRes.data);
    setStats(statsRes.data);
  };

  if (loading) return <div style={{ padding:'5rem 2rem', color:'var(--accent)', fontFamily:'JetBrains Mono,monospace' }}>Loading admin panel...</div>;

  const roleIcon = { patient:'🧑‍⚕️', nurse:'👩‍⚕️', doctor:'👨‍⚕️', admin:'🔐' };

  return (
    <div style={S.wrap}>
      <div style={S.title}>Admin Control Center</div>
      <div style={S.sub}>Full system overview — users, audit logs, risk events, compliance</div>

      <div style={S.statRow}>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--accent)' }}>{users.length}</div><div style={S.statLabel}>Total Users</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--blue)' }}>{stats.total || logs.length}</div><div style={S.statLabel}>Audit Blocks</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--danger)' }}>{stats.deniedCount || 0}</div><div style={S.statLabel}>Threats Blocked</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--warn)' }}>{stats.overrideCount || 0}</div><div style={S.statLabel}>Overrides</div></div>
      </div>

      <div style={S.grid}>
        <div>
          <div style={S.sectionHead}><div style={S.sectionTitle}>All Users</div><div style={S.chip}>{users.length} Active</div></div>
          {users.map(u => (
            <div key={u._id} style={{ ...S.userRow, borderColor: u.role === 'admin' ? 'rgba(251,146,60,.2)' : 'var(--border)' }}>
              <div>
                <div style={S.uName}>{roleIcon[u.role] || '👤'} {u.name}</div>
                <div style={S.uMeta}>{u.role} &nbsp;·&nbsp; {u.username} &nbsp;·&nbsp; Last: {u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString() : 'Never'}</div>
              </div>
              <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
                <span style={roleTag(u.role)}>{u.role}</span>
                {u.role !== 'patient' && (
                  <button style={S.btn} onClick={() => setRiskModal({ open:true, user:u })}>Simulate</button>
                )}
              </div>
            </div>
          ))}

          {/* Chain verify */}
          <div style={S.verifyBox}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'.9rem', fontWeight:700, marginBottom:'.5rem' }}>⛓️ Blockchain Integrity</div>
            <div style={{ fontSize:'.7rem', color:'var(--muted2)', marginBottom:'.75rem', lineHeight:1.7 }}>Verify that no audit log has been tampered with.</div>
            <button style={{ padding:'.6rem 1.5rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.7rem', textTransform:'uppercase', background:'var(--purple)', color:'#000', fontWeight:700, border:'none', cursor:'pointer', borderRadius:3 }} onClick={verifyChain}>
              🔍 Verify Chain
            </button>
            {chainResult && (
              <div style={{ marginTop:'.75rem', fontSize:'.7rem', lineHeight:1.7 }}>
                <div style={{ color: chainResult.chainValid ? 'var(--accent)' : 'var(--danger)', fontWeight:700 }}>
                  {chainResult.chainValid ? '✅ Chain Valid — No tampering detected' : '❌ Chain INVALID — Tampering detected!'}
                </div>
                <div style={{ color:'var(--muted2)', marginTop:'.25rem' }}>{chainResult.blocks?.length} blocks verified</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={S.sectionHead}><div style={S.sectionTitle}>Full Blockchain Audit Log</div><div style={S.chip}>Immutable</div></div>
          <div style={{ ...S.card, maxHeight:600, overflowY:'auto' }}>
            <AuditTable logs={logs} columns="full" />
          </div>
        </div>
      </div>

      <RiskModal
        open={riskModal.open}
        onClose={() => { setRiskModal({ open:false, user:null }); refreshLogs(); }}
        patientId={null}
        patientName={riskModal.user?.name || 'Test Patient'}
      />
    </div>
  );
}
