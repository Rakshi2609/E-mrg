'use client';

import React, { useState } from 'react';
import { 
  Phone, User, Globe, MapPin, AlertTriangle, ShieldAlert,
  Users, Activity, Navigation, ExternalLink, Activity as Heart,
  Search, ListFilter, PlayCircle, MoreHorizontal, Maximize2, Bot
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => <div style={{ height: '180px', width: '100%', background: 'var(--bg-secondary)', borderRadius: '12px' }} />
});

function LiveClock() {
  const [time, setTime] = React.useState<Date | null>(null);
  
  React.useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono), monospace', fontSize: '1.1rem' }}>
      <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 8px var(--accent-red)' }}></div>
      {time.toLocaleTimeString()}
    </div>
  );
}

function LiveCounter({ initial }: { initial: string }) {
  const [seconds, setSeconds] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Parse "T+00:27" or "T-00:00"
    let startSeconds = 0;
    if (initial.startsWith('T+')) {
      const parts = initial.substring(2).split(':');
      if (parts.length === 2) {
        startSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
    }
    setSeconds(startSeconds);

    const timer = setInterval(() => setSeconds(s => (s !== null ? s + 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [initial]);

  if (seconds === null) return <span>{initial}</span>;

  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  
  return <span>T+{m}:{s}</span>;
}

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState('transcript');
  const { calls, incidents } = useLiveData();
  
  const activeCall = calls.find(c => c.status === 'Active') || calls[0];

  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Call</h2>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span> LIVE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeCall.id}</span>
          <div style={{ border: '1px solid #ef4444', color: 'var(--accent-red)', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LiveClock />
          </div>
        </div>
      </div>

      {/* Main 3 Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '25% 45% 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Caller Information */}
          <article style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Caller Intel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '12px' }}><Phone size={18} color="var(--accent-red)" /></div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{activeCall.phone}</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Mobile • Verified</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '12px' }}><User size={18} color="var(--accent-red)" /></div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{activeCall.caller}</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Caller ID Match</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '12px' }}><MapPin size={18} color="var(--accent-red)" /></div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{activeCall.location}</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Cell Tower Triangulation</p>
                </div>
              </div>
            </div>
          </article>

          {/* Call Overview */}
          <article style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Threat Matrix</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Incident Type</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{activeCall.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Severity Level</span>
                <span style={{ fontWeight: 800, color: activeCall.severity === 'CRITICAL' || activeCall.severity === 'HIGH' ? 'var(--accent-red)' : activeCall.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6', fontSize: '0.9rem', textShadow: activeCall.severity === 'CRITICAL' ? '0 0 10px rgba(255,51,102,0.5)' : 'none' }}>{activeCall.severity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>AI Confidence</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>92%</span>
                  <div style={{ width: '60px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', background: '#10b981', borderRadius: '3px', boxShadow: '0 0 8px #10b981' }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Required Units</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>EMS, Police</span>
              </div>
            </div>
          </article>

        </div>

        {/* Middle Column */}
        <article style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div onClick={() => setActiveTab('transcript')} style={{ flex: 1, textAlign: 'center', padding: '1rem', borderBottom: activeTab === 'transcript' ? '2px solid var(--accent-red)' : '2px solid transparent', color: activeTab === 'transcript' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s', textShadow: activeTab === 'transcript' ? '0 0 12px rgba(255,255,255,0.3)' : 'none' }}>Live Intercept</div>
            <div onClick={() => setActiveTab('summary')} style={{ flex: 1, textAlign: 'center', padding: '1rem', borderBottom: activeTab === 'summary' ? '2px solid var(--accent-red)' : '2px solid transparent', color: activeTab === 'summary' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s', textShadow: activeTab === 'summary' ? '0 0 12px rgba(255,255,255,0.3)' : 'none' }}>AI Synthesis</div>
            <div onClick={() => setActiveTab('ai')} style={{ flex: 1, textAlign: 'center', padding: '1rem', borderBottom: activeTab === 'ai' ? '2px solid var(--accent-red)' : '2px solid transparent', color: activeTab === 'ai' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s', textShadow: activeTab === 'ai' ? '0 0 12px rgba(255,255,255,0.3)' : 'none' }}>Copilot Neural Net</div>
          </div>

          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            
            {activeTab === 'transcript' && (
              <>
                {activeCall.transcript?.map((line, idx) => (
                  <div key={idx} className={`animate-fade-up delay-${Math.min((idx+1)*100, 400)}`} style={{ display: 'flex', gap: '0.75rem', flexDirection: line.speaker === 'COPILOT_SYS' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: line.speaker === 'COPILOT_SYS' ? 'rgba(255,51,102,0.1)' : 'var(--bg-secondary)', color: line.speaker === 'COPILOT_SYS' ? 'var(--text-primary)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: line.speaker === 'COPILOT_SYS' ? '1px solid rgba(255,51,102,0.3)' : '1px solid var(--border-color)' }}>
                      {line.speaker === 'COPILOT_SYS' ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div style={{ flex: 1, background: line.speaker === 'COPILOT_SYS' ? 'rgba(255,51,102,0.05)' : 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: line.speaker === 'COPILOT_SYS' ? '12px 0 12px 12px' : '0 12px 12px 12px', border: line.speaker === 'COPILOT_SYS' ? '1px solid rgba(255,51,102,0.2)' : '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        {line.speaker === 'COPILOT_SYS' ? (
                          <>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono), monospace' }}>{line.time}</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{line.speaker}</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{line.speaker}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono), monospace' }}>{line.time}</span>
                          </>
                        )}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5, textAlign: 'left' }}>
                        {line.text}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'summary' && (
              <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--accent-red-light)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-red)', boxShadow: '0 0 15px var(--accent-red)' }}></div>
                <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800 }}>NEURAL SYNTHESIS REPORT</h4>
                <div style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  <p className="typewriter" style={{ margin: 0, whiteSpace: 'normal', borderRight: 'none', animation: 'fadeUp 1s ease-in-out' }}>
                    {activeCall.summary}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                  <div className="pulse-dot" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', background: 'var(--accent-red-light)', borderRadius: '50%', zIndex: 0 }}></div>
                  <Bot size={64} style={{ color: 'var(--accent-red)', position: 'relative', zIndex: 1 }} />
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>COPILOT ONLINE</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Neural network is actively analyzing audio streams...</p>
                <button style={{ padding: '1rem 2rem', background: 'var(--accent-red)', border: 'none', borderRadius: '99px', color: '#fff', fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,51,102,0.4)', transition: 'all 0.3s' }}>OVERRIDE & COMMAND</button>
              </div>
            )}

          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(255,51,102,0.03)', borderTop: '1px solid rgba(255,51,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,51,102,0.1), transparent)', animation: 'wave 3s linear infinite' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
              <div className="pulse-dot" style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 15px var(--accent-red)' }}></div>
              <div>
                <span style={{ color: 'var(--accent-red)', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.1em', display: 'block' }}>REAL-TIME AUDIO INTERCEPT ACTIVE</span>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono), monospace', fontWeight: 600 }}>
                  <span>SNR: 42dB</span>
                  <span>LATENCY: 12ms</span>
                  <span>ENC: AES-256</span>
                </div>
              </div>
            </div>
            
            {/* High-Res Spectrum Analyzer */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '32px', position: 'relative', zIndex: 1 }}>
              {[...Array(24)].map((_, i) => (
                <div key={i} className="mic-bar" style={{ 
                  animationDelay: `${(i % 5) * -0.2}s`, 
                  animationDuration: `${0.5 + (i % 3) * 0.2}s`, 
                  width: '4px',
                  borderRadius: '2px',
                  background: 'var(--accent-red)'
                }}></div>
              ))}
            </div>
          </div>

        </article>

        {/* Right Column */}
        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <article style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Geo-Tracker</h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '99px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span> SAT-LINK: OPTIMAL
              </span>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', height: '140px', borderRadius: '12px', marginBottom: '1rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--accent-red-light)' }}>
              <DynamicMap minimap={true} incidents={[{ id: activeCall.id, type: 'Intercept Tracking', severity: 'LIVE', status: 'Tracking' }]} />
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>{activeCall.location}</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono), monospace' }}>COORD: 39.7817° N, 89.6501° W</p>
            </div>
          </article>

          <article style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Event Sequence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
              
              {activeCall.sequence?.map((seq, idx) => (
                <div key={seq.id} className={`animate-fade-up delay-${Math.min((idx+1)*100, 400)}`} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-color)', border: '2px solid var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px var(--accent-red-light)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)' }}></div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{seq.title}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)', fontFamily: 'var(--font-mono), monospace', fontWeight: 700 }}>
                        <LiveCounter initial={seq.time} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                </div>
                <div style={{ flex: 1, padding: '0.75rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>AWAITING COMMAND</p>
                  </div>
                </div>
              </div>

            </div>
          </article>

        </div>

      </div>

    </div>
  );
}

