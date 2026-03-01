import React, { useState } from 'react';
import api from '../utils/api';

const sensitivityColor = { Standard:'var(--accent)', Sensitive:'var(--warn)', 'Ultra-Sensitive':'var(--danger)' };
const sensitivityTag = { Standard:'tag-green', Sensitive:'tag-warn', 'Ultra-Sensitive':'tag-red' };

export default function PrivacyToggle({ record, onUpdate }) {
  const [locked, setLocked]   = useState(record.isLocked);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/records/${record._id}/lock`, { isLocked: !locked });
      setLocked(data.isLocked);
      onUpdate && onUpdate({ ...record, isLocked: data.isLocked });
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating record');
    } finally {
      setLoading(false);
    }
  };

  const color = sensitivityColor[record.sensitivity] || 'var(--accent)';

  const S = {
    card: { background:'var(--card)', border:`1px solid ${locked ? 'rgba(244,63,94,.3)' : 'var(--border)'}`, borderRadius:6, padding:'1.25rem', marginBottom:'1rem', transition:'border-color .2s' },
    header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.5rem' },
    title: { fontSize:'.85rem', fontWeight:700 },
    sens: { fontSize:'.6rem', letterSpacing:'.08em', textTransform:'uppercase', padding:'.2rem .6rem', borderRadius:3, background:`rgba(${color === 'var(--accent)' ? '0,245,196' : color === 'var(--warn)' ? '251,146,60' : '244,63,94'},.1)`, color },
    meta: { fontSize:'.62rem', color:'var(--muted2)', marginBottom:'.75rem', lineHeight:1.6 },
    row: { display:'flex', alignItems:'center', justifyContent:'space-between' },
    toggleLabel: { fontSize:'.62rem', letterSpacing:'.08em', textTransform:'uppercase', color:'var(--muted2)' },
    status: { fontSize:'.62rem', marginTop:'.5rem', color: locked ? 'var(--danger)' : 'var(--accent)' },
  };

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div style={S.title}>{record.type === 'psychiatric' ? '🧠' : record.type === 'prescription' ? '💊' : '🩺'} {record.title}</div>
        <span style={S.sens}>{record.sensitivity}</span>
      </div>
      <div style={S.meta}>Dr. {record.doctor} &nbsp;·&nbsp; {new Date(record.date).toLocaleDateString()}</div>
      <div style={S.row}>
        <div style={S.toggleLabel}>Lock this record</div>
        <div onClick={toggle} style={{ position:'relative', width:44, height:24, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
          <div style={{ position:'absolute', inset:0, background: locked ? 'var(--danger)' : 'var(--border2)', borderRadius:12, transition:'.3s' }} />
          <div style={{ position:'absolute', width:18, height:18, top:3, left: locked ? 23 : 3, background:'#fff', borderRadius:'50%', transition:'.3s' }} />
        </div>
      </div>
      <div style={S.status}>{locked ? '🔒 Locked — only you can unlock' : '🔓 Accessible to assigned staff'}</div>
    </div>
  );
}
