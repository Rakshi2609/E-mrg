'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const SESSION_KEY = 'emrg_dispatcher_token';

export function AuthGuard({ children }: { children: React.ReactNode }): React.JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setAuthenticated(true);
      return;
    }
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  return authenticated ? <>{children}</> : null;
}

export function clearDispatcherSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
