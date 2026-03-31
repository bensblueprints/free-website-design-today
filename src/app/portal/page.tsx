'use client';

import { useEffect } from 'react';

export default function PortalRedirect() {
  useEffect(() => {
    window.location.href = '/portal/index.html';
  }, []);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#8a8880', fontFamily: 'sans-serif' }}>Redirecting to portal...</p>
    </div>
  );
}
