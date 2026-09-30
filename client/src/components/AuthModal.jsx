import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthModal({ onClose, onAuthSuccess, isPage = false }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login'
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

    const body = mode === 'login'
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isPage) {
    return (
      <div className="w-full rounded-2xl border shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderColor: '#334155',
        }}
      >
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              {mode === 'login'
                ? 'Sign in to access your review history'
                : 'Start reviewing code smarter'}
            </p>
          </div>
        </div>

        <div className="h-px mx-8" style={{ backgroundColor: '#334155' }} />

        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-4">
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg border text-[#fca5a5] bg-red-500/10 border-red-500/30"
            >
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#cbd5e1]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all bg-[#0f172a] border border-[#334155] text-[#e2e8f0] focus:border-[#6366f1]"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#cbd5e1]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all bg-[#0f172a] border border-[#334155] text-[#e2e8f0] focus:border-[#6366f1]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#cbd5e1]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all bg-[#0f172a] border border-[#334155] text-[#e2e8f0] focus:border-[#6366f1]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all mt-2 ${loading ? 'cursor-not-allowed opacity-70 bg-[#4338ca]' : 'bg-gradient-to-r from-[#6366f1] to-[#a855f7]'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm mt-4 text-[#94a3b8]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-[#6366f1] hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderColor: '#334155',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              {mode === 'login'
                ? 'Sign in to access your review history'
                : 'Start reviewing code smarter'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none transition-colors hover:text-white"
            style={{ color: '#94a3b8' }}
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px mx-8" style={{ backgroundColor: '#334155' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg border"
              style={{
                color: '#fca5a5',
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderColor: 'rgba(239,68,68,0.3)',
              }}
            >
              {error}
            </div>
          )}

          {/* Name (register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
                onFocus={e => (e.target.style.borderColor = '#6366f1')}
                onBlur={e => (e.target.style.borderColor = '#334155')}
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#e2e8f0',
              }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#334155')}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
              required
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#e2e8f0',
              }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#334155')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all mt-2"
            style={{
              background: loading
                ? '#4338ca'
                : 'linear-gradient(90deg, #6366f1, #a855f7)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          {/* Switch mode */}
          <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold transition-colors hover:underline"
              style={{ color: '#818cf8' }}
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
