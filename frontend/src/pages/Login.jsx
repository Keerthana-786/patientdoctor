import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id:'patient', icon:'🧑‍⚕️', label:'Patient',  hint:'john.patient' },
  { id:'nurse',   icon:'👩‍⚕️', label:'Nurse',    hint:'priya.nurse' },
  { id:'doctor',  icon:'👨‍⚕️', label:'Doctor',   hint:'raj.doctor' },
  { id:'admin',   icon:'🔐', label:'Admin',    hint:'admin.secure' },
];

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  box: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, padding:'2.5rem', width:'100%', maxWidth:430 },
  logoRow: { display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2rem' },
  logoIcon: { width:42, height:42, background:'var(--accent-dim)', border:'1px solid var(--accent)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' },
  logo: { fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1rem' },
  roleGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginBottom:'1.75rem' },
  roleBtn: (selected) => ({ background: selected ? 'var(--accent-dim)' : 'var(--surface)', border:`1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, borderRadius:5, padding:'1rem', cursor:'pointer', textAlign:'center', transition:'all .2s' }),
  roleIcon: { fontSize:'1.5rem', marginBottom:'.4rem' },
  roleName: (selected) => ({ fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', color: selected ? 'var(--accent)' : 'var(--muted2)' }),
  label: { fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:'.4rem', display:'block' },
  input: { width:'100%', background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'JetBrains Mono,monospace', fontSize:'.75rem', padding:'.65rem .9rem', borderRadius:3, outline:'none', marginBottom:'1rem', transition:'border-color .2s' },
  btn: { width:'100%', padding:'.8rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.75rem', letterSpacing:'.08em', textTransform:'uppercase', background:'var(--accent)', color:'#000', fontWeight:700, border:'none', cursor:'pointer', borderRadius:3, marginTop:'.75rem' },
  hint: { fontSize:'.62rem', color:'var(--muted)', marginTop:'.5rem', lineHeight:1.6 },
  error: { fontSize:'.72rem', color:'var(--danger)', background:'var(--danger-dim)', border:'1px solid var(--danger)', borderRadius:3, padding:'.6rem .9rem', marginBottom:'.75rem' },
};

export default function Login() {
  const [role, setRole]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const selectRole = (r) => {
    setRole(r);
    const hint = ROLES.find(ro => ro.id === r)?.hint;
    setUsername(hint || '');
    setPassword('demo1234');
    setError('');
  };

  const handleLogin = async () => {
    if (!role) { setError('Please select a role'); return; }
    if (!username || !password) { setError('Enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(username, password);
      navigate('/' + user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* bg orbs */}
      <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,245,196,.07),transparent 70%)', top:-100, left:'50%', transform:'translateX(-50%)', filter:'blur(80px)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,.1),transparent 70%)', bottom:0, right:0, filter:'blur(80px)', pointerEvents:'none' }} />

      <div style={S.box}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}>🛡️</div>
          <div>
            <div style={S.logo}>Quantum<span style={{ color:'var(--accent)' }}>Shield</span></div>
            <div style={{ fontSize:'.58rem', color:'var(--muted2)', letterSpacing:'.12em', textTransform:'uppercase' }}>Secure Healthcare Platform</div>
          </div>
        </div>

        <div style={{ fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:'.6rem' }}>Select Your Role</div>
        <div style={S.roleGrid}>
          {ROLES.map(r => (
            <div key={r.id} style={S.roleBtn(role === r.id)} onClick={() => selectRole(r.id)}>
              <div style={S.roleIcon}>{r.icon}</div>
              <div style={S.roleName(role === r.id)}>{r.label}</div>
            </div>
          ))}
        </div>

        {error && <div style={S.error}>{error}</div>}

        <label style={S.label}>Username</label>
        <input style={S.input} type="text" placeholder="e.g. john.patient" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />

        <div style={S.hint}>Demo — Password: <span style={{ color:'var(--accent)' }}>demo1234</span> for all accounts. Select a role to auto-fill.</div>

        <button style={{ ...S.btn, opacity: loading ? .6 : 1 }} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login → Enter System'}
        </button>
      </div>
    </div>
  );
}
