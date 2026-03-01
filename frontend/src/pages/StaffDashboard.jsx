import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import RiskModal from '../components/RiskModal';
import EmergencyOverride from '../components/EmergencyOverride';
import AuditTable from '../components/AuditTable';

const sensBg   = { Standard:'var(--accent-dim)', Sensitive:'var(--warn-dim)', 'Ultra-Sensitive':'var(--danger-dim)' };
const sensColor = { Standard:'var(--accent)',    Sensitive:'var(--warn)',     'Ultra-Sensitive':'var(--danger)' };

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
  patientItem: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:'1rem 1.25rem', marginBottom:'.75rem', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'border-color .2s' },
  pName: { fontSize:'.85rem', fontWeight:700 },
  pMeta: { fontSize:'.62rem', color:'var(--muted2)', marginTop:'.15rem' },
  tag: (s) => ({ background: sensBg[s], color: sensColor[s], padding:'.2rem .6rem', borderRadius:3, fontSize:'.6rem', letterSpacing:'.08em', textTransform:'uppercase' }),
  btn: { padding:'.45rem 1rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.65rem', letterSpacing:'.08em', textTransform:'uppercase', background:'var(--accent)', color:'#000', fontWeight:700, border:'none', cursor:'pointer', borderRadius:3 },
  card: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:6, padding:0, overflow:'hidden' },
};

// Step-up OTP modal
function StepUpModal({ open, onClose, onVerify, patientName }) {
  const [otp, setOtp] = useState(['','','','']);
  const [loading, setLoading] = useState(false);

  const handleInput = (val, idx) => {
    const next = [...otp]; next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 3) document.getElementById(`otp-${idx+1}`)?.focus();
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 4) return;
    setLoading(true);
    try {
      const { data } = await api.post('/access/stepup-verify', { otp: code, patientName });
      onVerify(data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(4,8,16,.92)', backdropFilter:'blur(8px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--warn)', borderRadius:8, width:'100%', maxWidth:380, padding:'2rem' }}>
        <div style={{ fontSize:'.6rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--warn)', marginBottom:'.5rem' }}>⚠️ Step-Up Authentication</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:'1.2rem', fontWeight:800, marginBottom:'.5rem' }}>Verify Your Identity</div>
        <div style={{ fontSize:'.7rem', color:'var(--muted2)', lineHeight:1.7, marginBottom:'1.25rem' }}>Moderate risk detected. Enter the 4-digit OTP sent to your registered device. (Any 4 digits for demo)</div>
        <div style={{ display:'flex', gap:'.5rem', justifyContent:'center', marginBottom:'1rem' }}>
          {[0,1,2,3].map(i => (
            <input key={i} id={`otp-${i}`} maxLength={1} value={otp[i]}
              onChange={e => handleInput(e.target.value, i)}
              style={{ width:44, height:52, background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:4, textAlign:'center', fontFamily:'Syne,sans-serif', fontSize:'1.5rem', fontWeight:800, color:'var(--warn)', outline:'none' }} />
          ))}
        </div>
        <button style={{ width:'100%', padding:'.75rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.72rem', textTransform:'uppercase', background:'var(--accent)', color:'#000', fontWeight:700, border:'none', cursor:'pointer', borderRadius:3, opacity: loading ? .6 : 1 }} onClick={verify} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Access'}
        </button>
        <button style={{ width:'100%', padding:'.75rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.72rem', textTransform:'uppercase', background:'transparent', color:'var(--text)', border:'1px solid var(--border2)', cursor:'pointer', borderRadius:3, marginTop:'.5rem' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const isDoctor = user.role === 'doctor';

  const [patients, setPatients]   = useState([]);
  const [logs, setLogs]           = useState([]);
  const [stats, setStats]         = useState({ granted:0, denied:0, stepup:0 });
  const [riskModal, setRiskModal] = useState({ open:false, patient:null });
  const [stepUpModal, setStepUpModal] = useState({ open:false, patient:null });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, logsRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/audit'),
        ]);
        setPatients(usersRes.data.filter(u => u.role === 'patient'));
        setLogs(logsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const refreshLogs = async () => {
    const res = await api.get('/audit');
    setLogs(res.data);
    const granted = res.data.filter(l => l.status === 'Granted').length;
    const denied  = res.data.filter(l => l.status === 'Denied').length;
    setStats({ granted, denied });
  };

  const openRisk = (patient) => setRiskModal({ open:true, patient });
  const onStepUp = (patient) => { setRiskModal({ open:false, patient:null }); setStepUpModal({ open:true, patient }); };

  if (loading) return <div style={{ padding:'5rem 2rem', color:'var(--accent)', fontFamily:'JetBrains Mono,monospace' }}>Loading dashboard...</div>;

  return (
    <div style={S.wrap}>
      <div style={S.title}>{isDoctor ? 'Doctor' : 'Nurse'} Dashboard</div>
      <div style={S.sub}>Click "Request Access" — AI risk engine evaluates each request in real-time</div>

      <div style={S.statRow}>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--accent)' }}>{patients.length}</div><div style={S.statLabel}>Patients</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--accent)' }}>{stats.granted}</div><div style={S.statLabel}>Granted</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--danger)' }}>{stats.denied}</div><div style={S.statLabel}>Denied</div></div>
        <div style={S.statCard}><div style={{ ...S.statNum, color:'var(--blue)' }}>{logs.length}</div><div style={S.statLabel}>Total Logs</div></div>
      </div>

      <div style={S.grid}>
        <div>
          <div style={S.sectionHead}><div style={S.sectionTitle}>Patient Access Panel</div><div style={S.chip}>AI-Guarded</div></div>
          {patients.map(p => (
            <div key={p._id} style={S.patientItem}>
              <div>
                <div style={S.pName}>🧑‍⚕️ {p.name}</div>
                <div style={S.pMeta}>{p.patientId || p._id.toString().slice(-6)}</div>
              </div>
              <button style={S.btn} onClick={() => openRisk(p)}>Request Access</button>
            </div>
          ))}

          {isDoctor && (
            <EmergencyOverride patients={patients} onSuccess={refreshLogs} />
          )}
        </div>

        <div>
          <div style={S.sectionHead}><div style={S.sectionTitle}>Access Log</div><div style={S.chip}>Blockchain Secured</div></div>
          <div style={S.card}><AuditTable logs={logs} columns="simple" /></div>
        </div>
      </div>

      <RiskModal
        open={riskModal.open}
        onClose={() => { setRiskModal({ open:false, patient:null }); refreshLogs(); }}
        onStepUp={() => onStepUp(riskModal.patient)}
        patientId={riskModal.patient?._id}
        patientName={riskModal.patient?.name}
      />

      <StepUpModal
        open={stepUpModal.open}
        onClose={() => setStepUpModal({ open:false, patient:null })}
        onVerify={refreshLogs}
        patientName={stepUpModal.patient?.name}
      />
    </div>
  );
}
