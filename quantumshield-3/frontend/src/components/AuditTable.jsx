import React from 'react';

const DECISION_STYLE = {
  granted: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '✅ Granted' },
  denied: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '🚫 Denied' },
  step_up: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '⚠️ Step-Up' }
};

export default function AuditTable({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
        No audit logs found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e3a5f' }}>
            {['#', 'Time', 'User', 'Role', 'Action', 'Risk', 'Decision', 'Hash'].map(h => (
              <th key={h} style={{
                padding: '10px 12px',
                textAlign: 'left',
                color: '#6b7280',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => {
            const ds = DECISION_STYLE[log.accessDecision] || DECISION_STYLE.granted;
            return (
              <tr key={log._id} style={{
                borderBottom: '1px solid #0f172a',
                transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a2540'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>{log.blockIndex || i + 1}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '10px 12px', color: '#e0e6ff', fontWeight: 500 }}>
                  {log.username}
                </td>
                <td style={{ padding: '10px 12px', color: '#60a5fa', textTransform: 'capitalize' }}>
                  {log.userRole}
                </td>
                <td style={{ padding: '10px 12px', color: '#d1d5db', fontFamily: 'monospace' }}>
                  {log.action}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    color: log.riskScore >= 75 ? '#ef4444' : log.riskScore >= 50 ? '#f59e0b' : '#10b981',
                    fontWeight: 700
                  }}>
                    {log.riskScore}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    background: ds.bg,
                    color: ds.color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {ds.label}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#4b5563', fontFamily: 'monospace', fontSize: '10px' }}>
                  {log.blockHash?.slice(0, 12)}...
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
