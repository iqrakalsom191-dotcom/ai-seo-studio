'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleGoogleLogin() {
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://ai-seo-studio-sable.vercel.app/auth/callback' },
    })
    if (error) setError(error.message)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes float1 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(20px) scale(0.95); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-20px) scale(1.08); } }
        .blob1 { animation: float1 8s ease-in-out infinite; }
        .blob2 { animation: float2 10s ease-in-out infinite; }
        .blob3 { animation: float3 12s ease-in-out infinite; }
        .input-field:focus { border-color: #6C47FF !important; box-shadow: 0 0 0 3px rgba(108,71,255,0.15) !important; }
        .login-btn:hover { background: #5535e0 !important; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(108,71,255,0.4) !important; }
        .login-btn { transition: all 0.2s ease !important; }
        .google-btn:hover { background: #f5f5fa !important; border-color: #d8d8e5 !important; }
        .google-btn { transition: all 0.2s ease !important; }
      `}</style>

      {/* Left — Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #6C47FF 0%, #4a2dd4 40%, #00C6AE 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '64px 48px', color: '#fff', position: 'relative', overflow: 'hidden' }}>

        {/* Blobs */}
        <div className="blob1" style={{ position: 'absolute', top: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(2px)' }} />
        <div className="blob2" style={{ position: 'absolute', bottom: '-100px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,198,174,0.15)', filter: 'blur(4px)' }} />
        <div className="blob3" style={{ position: 'absolute', top: '40%', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px', width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', backdropFilter: 'blur(10px)' }}>🔍</div>
            <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>AI SEO Studio</span>
          </div>

          {/* Hero Text */}
          <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1px' }}>
            Rank higher.<br />
            <span style={{ color: '#a8f0e8' }}>Write smarter.</span>
          </h1>
          <p style={{ fontSize: '17px', opacity: 0.85, lineHeight: '1.6', marginBottom: '48px' }}>
            Generate SEO-optimized content, meta tags, and keyword strategies — powered by AI, built for results.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '48px' }}>
            {[['10x', 'Faster Content'], ['500+', 'SEO Tools'], ['99%', 'Uptime']].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>{val}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[['⚡', 'AI-powered blog generation in seconds'], ['🎯', 'Smart keyword analysis & suggestions'], ['🔒', 'Your data, fully secured']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', opacity: 0.9 }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F7F8FC', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 20px 60px rgba(108,71,255,0.12), 0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(108,71,255,0.08)' }}>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '-0.5px' }}>Welcome back</h2>
            <p style={{ color: '#4A4A6A', fontSize: '15px' }}>Sign in to your account</p>
          </div>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px 16px', color: '#cc0000', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#fff', color: '#1A1A2E', border: '1.5px solid #e8e8f0', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.94H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.06l3.01-2.34z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e8e8f0' }} />
            <span style={{ fontSize: '13px', color: '#9a9ab0', fontWeight: '500' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e8e8f0' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '0.2px' }}>Email address</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e8e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#1A1A2E', transition: 'all 0.2s' }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '0.2px' }}>Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e8e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#1A1A2E', transition: 'all 0.2s' }}
            />
          </div>

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#a89be0' : '#6C47FF', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(108,71,255,0.3)', letterSpacing: '0.2px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f5' }}>
            <p style={{ color: '#4A4A6A', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: '#6C47FF', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
