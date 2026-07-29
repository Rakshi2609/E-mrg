import React from 'react';
import { TrendingUp, Users, Clock, AlertTriangle, Activity, BarChart3, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>System Reports & Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time metrics and historical performance data.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}>
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <button style={{ background: 'var(--text-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--card-bg)', fontWeight: 600, cursor: 'pointer' }}>Export Data</button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { label: 'Total Calls', value: '1,482', change: '+12%', up: true, icon: <PhoneCall /> },
          { label: 'Avg Response Time', value: '03:14', change: '-15%', up: true, icon: <Clock /> }, // Lower is better
          { label: 'Critical Incidents', value: '42', change: '+5%', up: false, icon: <AlertTriangle /> },
          { label: 'Active Dispatchers', value: '18', change: '0%', up: true, icon: <Users /> }
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stat.label}</span>
              <div style={{ color: 'var(--text-muted)' }}>{/* stat.icon rendering skipped for brevity, but let's just render a dot */} <Activity size={18} /> </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: stat.up ? '#10b981' : 'var(--accent-red)' }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flex: 1 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Call Volume Trends</h3>
            <BarChart3 size={20} color="var(--text-muted)" />
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            {[30, 45, 60, 40, 75, 90, 65, 55, 80, 100, 70, 50].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 9 ? 'var(--accent-red)' : 'var(--bg-tertiary)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{i*2}h</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Incident Distribution</h3>
            <PieChart size={20} color="var(--text-muted)" />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
            {[
              { label: 'Medical Emergency', value: 45, color: '#3b82f6' },
              { label: 'Traffic Collision', value: 25, color: '#f59e0b' },
              { label: 'Fire', value: 15, color: 'var(--accent-red)' },
              { label: 'Other', value: 15, color: 'var(--text-muted)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}></div>
                    {item.label}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.value}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// simple PhoneCall mock
const PhoneCall = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
