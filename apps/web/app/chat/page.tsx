'use client';

import React, { useState } from 'react';
import { Bot, Send, Search } from 'lucide-react';

export default function ChatbotPage() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<any[]>([]);

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setChat(prev => [...prev, { type: 'ai', text: "I've analyzed the data. Here's a breakdown." }]);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI Assistant</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Ask anything about past incidents, trends, locations, or dispatch performance.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {["Where did most incidents happen last month?", "What are the most common incident types?", "Show high severity incidents in the past 7 days", "Average response time last month"].map(q => (
          <button key={q} style={{ background: 'var(--card-bg)', border: '1px solid #e5e7eb', padding: '0.75rem 1.25rem', borderRadius: '99px', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {q}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', paddingRight: '1rem' }}>
        
        {/* Mocked conversation from the image */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'var(--text-primary)', color: 'var(--card-bg)', padding: '1rem 1.5rem', borderRadius: '16px 16px 0 16px', maxWidth: '80%' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Where did most problems happen last month?</p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem' }}>10:30 AM ✓✓</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={18} color="var(--text-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Here's a summary of incident hotspots from last month (April 2025):</p>
            
            <div style={{ background: 'var(--card-bg)', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Top 5 Locations by Incident Count</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Rank</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Location</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Incident Count</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>1</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>Downtown Springfield</td>
                    <td style={{ padding: '0.75rem' }}>142</td>
                    <td style={{ padding: '0.75rem' }}>18.7%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>2</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>South 6th Street Corridor</td>
                    <td style={{ padding: '0.75rem' }}>118</td>
                    <td style={{ padding: '0.75rem' }}>15.6%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>3</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>North Grand Avenue</td>
                    <td style={{ padding: '0.75rem' }}>97</td>
                    <td style={{ padding: '0.75rem' }}>12.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Heat Map Overview</h4>
              <div style={{ height: '200px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                [Heatmap Visualization Rendered Here]
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.5 }}>
                Downtown Springfield and South 6th Street Corridor recorded the highest number of incidents, primarily Traffic Accidents and Medical Emergencies.
              </p>
            </div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about incidents, trends, or performance..."
            style={{ flex: 1, padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '0.95rem', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
          />
          <button type="submit" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Send size={18} />
          </button>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
          AI responses may not be 100% accurate. Always verify critical information.
        </p>
      </div>

    </div>
  );
}
