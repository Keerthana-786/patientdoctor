import React from 'react';

const statusStyle = {
  Granted:  { background:'var(--accent-dim)',  color:'var(--accent)' },
  Denied:   { background:'var(--danger-dim)',  color:'var(--danger)' },
  Override: { background:'var(--danger-dim)',  color:'var(--danger)' },
  'Step-Up':{ background:'var(--warn-dim)',    color:'var(--warn)' },
  Locked:   { background:'var(--purple-dim)',  color:'var(--purple)' },
  Unlocked: { background:'var(--blue-dim)',    color:'var(--blue)' },
};

const riskColor = (r) => r > 74 ? 'var(--danger)' : r > 49 ? 'var(--warn)' : 'var(--accent)';

const tag = (status) => (
  <span style={{ ...statusStyle[status], padding:'.2rem .6rem', borderRadius:3, fontSize:'.6rem', letterSpacing:'.08em', textTransform:'uppercase', display:'inline-block' }}>
    {status}
  </span>
);

export default function AuditTable({ logs = [], columns = 'full' }) {
  const S = {
    wrap: { overflowX:'auto' },
    table: { width:'100%', borderCollapse:'collapse', fontSize:'.65rem' },
    th: { textAlign:'left', padding:'.6rem .8rem', borderBottom:'1px solid var(--border)', color:'var(--muted2)', letterSpacing:'.1em', textTransform:'uppercase', fontWeight:500 },
    td: { padding:'.7rem .8rem', borderBottom:'1px solid rgba(26,37,64,.5)', verticalAlign:'top', lineHeight:1.5 },
    hash: { fontSize:'.55rem', color:'var(--muted)', letterSpacing:'.04em', marginTop:'.15rem' },
    empty: { padding:'2rem', textAlign:'center', color:'var(--muted2)', fontSize:'.75rem' },
  };

  if (!logs.length) return <div style={S.empty}>No audit logs yet</div>;

  const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) : '—';

  return (
    <div style={S.wrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>User</th>
            <th style={S.th}>Patient</th>
            <th style={S.th}>Action</th>
            <th style={S.th}>Risk</th>
            <th style={S.th}>Status</th>
            {columns === 'full' && <th style={S.th}>Block Hash</th>}
            <th style={S.th}>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={log._id || i} style={{ background: i === 0 ? 'rgba(0,245,196,.04)' : 'transparent' }}>
              <td style={S.td}>
                <div style={{ fontWeight:700 }}>{log.username}</div>
                <div style={S.hash}>{log.userRole}</div>
              </td>
              <td style={S.td}>{log.patientName || '—'}</td>
              <td style={{ ...S.td, maxWidth:160 }}>{log.action}</td>
              <td style={{ ...S.td, fontWeight:700, color: riskColor(log.riskScore) }}>{log.riskScore}</td>
              <td style={S.td}>{tag(log.status)}</td>
              {columns === 'full' && (
                <td style={S.td}>
                  <div style={S.hash}>#{log.blockIndex}</div>
                  <div style={S.hash}>{log.blockHash?.substring(0, 20)}...</div>
                </td>
              )}
              <td style={{ ...S.td, color:'var(--muted2)' }}>{fmt(log.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
