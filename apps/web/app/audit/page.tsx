'use client';
import React from 'react';
import { Shield, FileText, Search, Filter, Download } from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

export default function AuditLogsPage() {
  const { logs } = useLiveData();


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Audit Logs</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Immutable record of all system events and user actions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input type="text" placeholder="Search logs..." style={{ border: 'none', outline: 'none', background: 'transparent', width: '200px', color: 'var(--text-primary)' }} />
          </div>
          <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
            <Filter size={16} /> Filter
          </button>
          <button style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Log ID</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>User / Actor</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Resource Target</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{log.id}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{log.time}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: log.user === 'System' || log.user.includes('API') ? 'var(--border-dark)' : 'var(--text-primary)', color: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                      {log.user.charAt(0)}
                    </div>
                    {log.user}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{log.action}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{log.resource}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                    background: log.status === 'Success' ? '#dcfce7' : 'var(--accent-red-light)',
                    color: log.status === 'Success' ? '#16a34a' : 'var(--accent-red)'
                  }}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Showing 1 to 6 of 1,248 entries</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'not-allowed' }}>Previous</button>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
