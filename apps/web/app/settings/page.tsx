'use client';
import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Smartphone, Globe, Save } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance');
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settings & Preferences</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your account settings and system preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Settings Sidebar */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
            { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'security', label: 'Security', icon: <Shield size={18} /> },
            { id: 'devices', label: 'Devices', icon: <Smartphone size={18} /> },
            { id: 'language', label: 'Language & Region', icon: <Globe size={18} /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-red)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
          
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Theme Preferences</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customize how the dispatcher dashboard looks on your device.</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Interface Theme</h4>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  
                  {/* Light Mode Option */}
                  <div 
                    onClick={() => setTheme('light')}
                    style={{ 
                      flex: 1, border: `2px solid ${theme === 'light' ? 'var(--accent-red)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' 
                    }}
                  >
                    <div style={{ width: '100%', height: '100px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px' }}>
                      <div style={{ height: '15px', background: '#ffffff', borderRadius: '4px', width: '100%' }}></div>
                      <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <div style={{ width: '30%', background: '#ffffff', borderRadius: '4px' }}></div>
                        <div style={{ flex: 1, background: '#ffffff', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Light Mode</span>
                  </div>

                  {/* Dark Mode Option */}
                  <div 
                    onClick={() => setTheme('dark')}
                    style={{ 
                      flex: 1, border: `2px solid ${theme === 'dark' ? 'var(--accent-red)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' 
                    }}
                  >
                    <div style={{ width: '100%', height: '100px', background: '#000000', borderRadius: '8px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px' }}>
                      <div style={{ height: '15px', background: '#09090b', borderRadius: '4px', width: '100%' }}></div>
                      <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <div style={{ width: '30%', background: '#09090b', borderRadius: '4px' }}></div>
                        <div style={{ flex: 1, background: '#09090b', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dark Mode (Pure Black)</span>
                  </div>
                  
                </div>
              </div>

              <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ background: 'var(--text-primary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'var(--card-bg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <Save size={18} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'appearance' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)' }}>
              <h2>Configuration area for {activeTab} coming in v2.</h2>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
