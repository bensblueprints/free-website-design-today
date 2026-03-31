'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';

export default function PortalLogin() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    if (token) {
      router.push('/portal/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignup && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSignup ? 'signup' : 'login',
          full_name: fullName,
          business_name: businessName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      localStorage.setItem('portal_token', data.token);
      localStorage.setItem('portal_client', JSON.stringify(data.client));
      router.push('/portal/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: '#0a0a0a',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <a
          href="/"
          className="flex items-center gap-2 no-underline"
          style={{ color: '#f5f3ef' }}
        >
          <Globe className="w-5 h-5" style={{ color: '#c9a962' }} />
          <span
            className="font-semibold text-lg"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            FreeWebsiteDesign.today
          </span>
        </a>
        <span
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: '#c9a962' }}
        >
          Client Portal
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Gold glow behind card */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(600px circle at 50% 50%, rgba(201,169,98,0.06) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-[440px] rounded-xl p-8"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#f5f3ef',
            }}
          >
            Client{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #c9a962, #d4b978)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Portal
            </span>
          </h1>
          <p className="mb-8" style={{ color: '#8a8880', fontSize: '0.95rem' }}>
            {isSignup ? 'Create an account to track your project.' : 'Sign in to manage your project.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.15em] mb-2"
                    style={{ color: '#8a8880' }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f5f3ef',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.15em] mb-2"
                    style={{ color: '#8a8880' }}
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Company LLC"
                    className="w-full px-4 py-3 rounded-lg text-sm"
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f5f3ef',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-[0.15em] mb-2"
                style={{ color: '#8a8880' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f5f3ef',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-[0.15em] mb-2"
                style={{ color: '#8a8880' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f5f3ef',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: '#ef4444' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: loading ? '#a88c4a' : '#c9a962',
                color: '#0a0a0a',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.target as HTMLElement).style.background = '#d4b978';
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.target as HTMLElement).style.background = '#c9a962';
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#8a8880' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="underline transition-colors"
              style={{ color: '#c9a962', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center" style={{ color: '#8a8880', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} FreeWebsiteDesign.today. All rights reserved.
      </footer>
    </main>
  );
}
