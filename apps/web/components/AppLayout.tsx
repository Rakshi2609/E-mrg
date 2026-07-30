'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PhoneCall, Users, AlertCircle, Map, Clock, FileText, 
  Bot, StickyNote, Shield, Settings, Search, Bell, ChevronDown, Menu 
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useLiveData } from '../context/LiveDataContext';
import { AuthGuard, clearDispatcherSession } from './AuthGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { calls, incidents } = useLiveData();
  const queuedCount = calls.filter(c => c.status === 'Queued').length;
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  let pageTitle = "Dashboard";
  const routes: Record<string, string> = {
    '/dashboard': 'Active Calls',
    '/queue': 'Call Queue',
    '/incidents': 'Incidents',
    '/map': 'Map View',
    '/records': 'History',
    '/analytics': 'Reports',
    '/chat': 'AI Assistant',
    '/notes': 'Notes',
    '/audit': 'Audit Logs',
    '/settings': 'Settings'
  };
  if (routes[pathname]) pageTitle = routes[pathname];

  return <AuthGuard>
    <div className="app-layout-container">
      
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-red)', color: 'var(--card-bg)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-1px' }}>EM</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>E-MRG</h1>
        </div>
        <button onClick={toggleMobileMenu} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ background: 'var(--accent-red)', color: 'var(--card-bg)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>EM</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>E-MRG</h1>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>AI Dispatcher Copilot</p>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }} onClick={closeMobileMenu}>
          <NavItem href="/dashboard" icon={<PhoneCall size={18} />} label="Active Calls" active={pathname === '/dashboard'} badge={calls.filter(c => c.status === 'Active').length.toString()} />
          <NavItem href="/queue" icon={<Users size={18} />} label="Call Queue" active={pathname === '/queue'} badge={queuedCount.toString()} badgeGray />
          <NavItem href="/incidents" icon={<AlertCircle size={18} />} label="Incidents" active={pathname === '/incidents'} />
          <NavItem href="/map" icon={<Map size={18} />} label="Map View" active={pathname === '/map'} />
          <NavItem href="/records" icon={<Clock size={18} />} label="History" active={pathname === '/records'} />
          <NavItem href="/analytics" icon={<FileText size={18} />} label="Reports" active={pathname === '/analytics'} />
          
          <div style={{ margin: '1rem 0', borderTop: '1px solid var(--border-color)' }}></div>
          
          <NavItem href="/chat" icon={<Bot size={18} />} label="AI Chatbot" active={pathname === '/chat'} badge="New" badgeGreen />
          <NavItem href="/notes" icon={<StickyNote size={18} />} label="Notes" active={pathname === '/notes'} />
          <NavItem href="/audit" icon={<Shield size={18} />} label="Audit Logs" active={pathname === '/audit'} />
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={() => { clearDispatcherSession(); window.location.assign('/login'); }} style={{ width: '100%', padding: '0.65rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>Sign out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  </AuthGuard>;
}

// Helper Component for Nav Items
function NavItem({ href, icon, label, active, badge, badgeGray, badgeGreen }: any) {
  return (
    <Link href={href} style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      padding: '0.6rem 0.75rem', borderRadius: '8px', textDecoration: 'none',
      background: active ? 'var(--bg-secondary)' : 'transparent',
      color: active ? 'var(--accent-red)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 500,
      transition: 'background 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon}
        <span style={{ fontSize: '0.9rem' }}>{label}</span>
      </div>
      {badge && (
        <span style={{ 
          background: badgeGreen ? '#dcfce7' : badgeGray ? 'var(--bg-secondary)' : active ? 'var(--accent-red)' : 'var(--accent-red)', 
          color: badgeGreen ? '#16a34a' : badgeGray ? 'var(--text-secondary)' : 'var(--card-bg)', 
          fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '99px' 
        }}>
          {badge}
        </span>
      )}
    </Link>
  );
}
