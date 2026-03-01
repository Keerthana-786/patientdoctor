import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const S = {
  nav: { position:'fixed', top:0, width:'100%', zIndex:200, background:'rgba(4,8,16,.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)', padding:'0 1.5rem', height:58, display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.05rem' },
  right: { display:'flex', alignItems:'center', gap:'1rem' },
  badge: { background:'#131b28', border:'1px solid var(--border2)', padding:'.3rem .8rem', borderRadius:3, fontSize:'.62rem', letterSpacing:'.1em', textTransform:'uppercase' },
  pill: { display:'flex', alignItems:'center', gap:'.4rem', fontSize:'.6rem', color:'var(--accent)' },
  dot: { width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'blink 1.4s ease infinite' },
  btn: { padding:'.4rem 1rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.7rem', letterSpacing:'.08em', textTransform:'uppercase', border:'1px solid var(--border2)', background:'transparent', color:'var(--text)', cursor:'pointer', borderRadius:3 },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={S.nav}>
      <div style={S.logo}>
        Quantum<span style={{ color:'var(--accent)' }}>Shield</span>
        <span style={{ fontSize:'.6rem', color:'var(--muted2)', fontFamily:'JetBrains Mono,monospace', marginLeft:'.5rem' }}>Health</span>
      </div>
      <div style={S.right}>
        <div style={S.pill}><div style={S.dot} /><span>LIVE SYSTEM</span></div>
        <div style={S.badge}>{user?.role?.toUpperCase()}</div>
        <div style={S.badge}>{user?.name}</div>
        <button style={S.btn} onClick={handleLogout}>Logout</button>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </nav>
  );
}
