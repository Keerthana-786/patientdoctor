import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const FACTOR_META = [
  { key: 'roleClearance',    label: 'Role Clearance',    color: 'var(--accent)' },
  { key: 'timeOfAccess',     label: 'Time of Access',    color: 'var(--blue)' },
  { key: 'deviceTrust',      label: 'Device Trust',      color: 'var(--purple)' },
  { key: 'dataSensitivity',  label: 'Data Sensitivity',  color: 'var(--warn)' },
  { key: 'behaviourPattern', label: 'Behaviour Pattern', color: 'var(--danger)' },
];

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(4,8,16,.92)', backdropFilter:'blur(8px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  box: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, width:'100%', maxWidth:520, padding:'2rem', animation:'slideUp .3s ease both' },
  title: { fontFamily:'Syne,sans-serif', fontSize:'1.2rem', fontWeight:800, letterSpacing:'-.5px', marginBottom:'.3rem' },
  sub: { fontSize:'.7rem', color:'var(--muted2)', marginBottom:'1.5rem' },
  factorLabel: { fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:'.75rem' },
  row: { display:'flex', alignItems:'center', gap:'1rem', marginBottom:'.6rem' },
  name: { fontSize:'.72rem', minWidth:140 },
  barWrap: { flex:1, height:6, background:'var(--border2)', borderRadius:3, overflow:'hidden' },
  val: { fontSize:'.65rem', fontWeight:700, width:32, textAlign:'right' },
  meter: { textAlign:'center', margin:'1.5rem 0' },
  scoreNum: { fontFamily:'Syne,sans-serif', fontSize:'3.5rem', fontWeight:800, lineHeight:1, transition:'color .5s' },
  scoreLabel: { fontSize:'.62rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted2)', marginTop:'.3rem' },
  result: { padding:'1rem', borderRadius:5, textAlign:'center', marginBottom:'1.25rem' },
  resultIcon: { fontSize:'1.5rem', marginBottom:'.3rem' },
  resultText: { fontSize:'.8rem', fontWeight:700, letterSpacing:'.05em' },
  resultSub: { fontSize:'.65rem', color:'var(--muted2)', marginTop:'.2rem' },
  btnRow: { display:'flex', gap:'.75rem', marginTop:'1.25rem' },
  btn: { flex:1, padding:'.65rem 1rem', fontFamily:'JetBrains Mono,monospace', fontSize:'.7rem', letterSpacing:'.08em', textTransform:'uppercase', border:'none', cursor:'pointer', borderRadius:3, fontWeight:700 },
  hash: { fontSize:'.58rem', color:'var(--muted)', marginTop:'.5rem', textAlign:'center', letterSpacing:'.04em' },
};

export default function RiskModal({ open, onClose, onStepUp, recordId, patientId, patientName, recordTitle }) {
  const [phase, setPhase]   = useState('idle'); // idle | running | done
  const [factors, setFactors] = useState({});
  const [animFactors, setAnimFactors] = useState({});
  const [score, setScore]   = useState(null);
  const [result, setResult] = useState(null);
  const [blockHash, setBlockHash] = useState('');

  useEffect(() => {
    if (open) { setPhase('idle'); setFactors({}); setAnimFactors({}); setScore(null); setResult(null); setBlockHash(''); }
  }, [open]);

  const runEngine = async () => {
    setPhase('running');
    setFactors({}); setAnimFactors({}); setScore(null); setResult(null);

    try {
      const { data } = await api.post('/access/request', {
        recordId, patientId, patientName,
        isKnownDevice: Math.random() > 0.2, // 80% chance known device
      });

      // Animate factors one by one
      const keys = Object.keys(data.factors);
      let i = 0;
      const iv = setInterval(() => {
        if (i >= keys.length) {
          clearInterval(iv);
          setTimeout(() => {
            setScore(data.score);
            setResult(data);
            setBlockHash(data.blockHash);
            setPhase('done');
            if (data.decision === 'Step-Up') {
              setTimeout(() => { onClose(); onStepUp && onStepUp(data); }, 2000);
            }
          }, 400);
          return;
        }
        const k = keys[i];
        setAnimFactors(prev => ({ ...prev, [k]: data.factors[k] }));
        i++;
      }, 380);

    } catch (err) {
      setPhase('done');
      setResult({ decision: 'Denied', reason: err.response?.data?.message || 'Server error' });
    }
  };

  if (!open) return null;

  const scoreColor = score === null ? 'var(--accent)' : score < 50 ? 'var(--accent)' : score < 75 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div style={S.overlay}>
      <div style={S.box}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={S.title}>🧠 AI Risk Engine</div>
        <div style={S.sub}>Evaluating: {patientName}{recordTitle ? ` → ${recordTitle}` : ''}</div>

        {/* Factors */}
        <div style={S.factorLabel}>Risk Factor Analysis</div>
        {FACTOR_META.map(f => (
          <div key={f.key} style={S.row}>
            <div style={S.name}>{f.label}</div>
            <div style={S.barWrap}>
              <div style={{ height:'100%', borderRadius:3, background:f.color, width:`${animFactors[f.key] || 0}%`, transition:'width .7s ease' }} />
            </div>
            <div style={{ ...S.val, color: f.color }}>{animFactors[f.key] ?? '—'}</div>
          </div>
        ))}

        {/* Score meter */}
        <div style={S.meter}>
          <div style={{ ...S.scoreNum, color: scoreColor }}>{phase === 'running' && score === null ? '...' : (score ?? '—')}</div>
          <div style={S.scoreLabel}>Overall Risk Score / 100</div>
        </div>

        {/* Result */}
        {result && (
          <div style={{ ...S.result, background: result.decision === 'Granted' ? 'var(--accent-dim)' : result.decision === 'Step-Up' ? 'var(--warn-dim)' : 'var(--danger-dim)', border: `1px solid ${result.decision === 'Granted' ? 'var(--accent)' : result.decision === 'Step-Up' ? 'var(--warn)' : 'var(--danger)'}` }}>
            <div style={S.resultIcon}>{result.decision === 'Granted' ? '✅' : result.decision === 'Step-Up' ? '⚠️' : '🚫'}</div>
            <div style={{ ...S.resultText, color: result.decision === 'Granted' ? 'var(--accent)' : result.decision === 'Step-Up' ? 'var(--warn)' : 'var(--danger)' }}>
              ACCESS {result.decision === 'Granted' ? 'GRANTED' : result.decision === 'Step-Up' ? 'STEP-UP REQUIRED' : 'DENIED'}
            </div>
            <div style={S.resultSub}>{result.reason}</div>
          </div>
        )}

        {blockHash && <div style={S.hash}>⛓️ Block Hash: {blockHash.substring(0,32)}...</div>}

        <div style={S.btnRow}>
          <button style={{ ...S.btn, background:'transparent', color:'var(--text)', border:'1px solid var(--border2)' }} onClick={onClose}>Close</button>
          <button style={{ ...S.btn, background:'var(--accent)', color:'#000' }} onClick={runEngine} disabled={phase === 'running'}>
            {phase === 'running' ? 'Evaluating...' : phase === 'done' ? 'Re-evaluate ↻' : '▶ Run AI Engine'}
          </button>
        </div>
      </div>
    </div>
  );
}
