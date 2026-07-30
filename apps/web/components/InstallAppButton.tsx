'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppButton(): React.JSX.Element {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const capturePrompt = (event: Event): void => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const clearPrompt = (): void => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', clearPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', clearPrompt);
    };
  }, []);

  const install = useCallback(async (): Promise<void> => {
    if (!installPrompt) {
      setMessage('Use your browser menu: Install app or Add to Home screen.');
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setMessage(outcome === 'accepted' ? 'E-MRG is installing.' : 'Installation was dismissed.');
    setInstallPrompt(null);
  }, [installPrompt]);

  return <div style={{ display: 'grid', justifyItems: 'end', gap: '0.35rem' }}>
    <button type="button" onClick={() => void install()} className="nav-btn" style={{ cursor: 'pointer' }}>Install App</button>
    {message && <span role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', maxWidth: '180px', textAlign: 'right' }}>{message}</span>}
  </div>;
}
