'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
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
        .signup-btn:hover { background: #5535e0 !important; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(108,71,255,0.4) !important; }
        .signup-btn { transition: all 0.2s ease !important; }
      `}</style>

      {/* Left — Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #6C47FF 0%, #4a2dd4 40%, #00C6AE 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '64px 48px', color: '#fff', position: 'relative', overflow: 'hidden' }}>

        <div className="blob1" style={{ position: 'absolute', top: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(2px)' }} />
        <div className="blob2" style={{ position: 'absolute', bottom: '-100px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,198,174,0.15)', filter: 'blur(4px)' }} />
        <div className="blob3" style={{ position: 'absolute', top: '40%', right: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', backdropFilter: 'blur(10px)' }}>🔍</div>
            <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>AI SEO Studio</span>
          </div>

          <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1px' }}>
            Start ranking.<br />
            <span style={{ color: '#a8f0e8' }}>Start today.</span>
          </h1>
          <p style={{ fontSize: '17px', opacity: 0.85, lineHeight: '1.6', marginBottom: '48px' }}>
            Join thousands of SEO professionals using AI to create content that ranks — faster than ever.
          </p>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '48px' }}>
            {[['10x', 'Faster Content'], ['500+', 'SEO Tools'], ['99%', 'Uptime']].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '24px', fontWeight: '800' }}>{val}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

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
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '-0.5px' }}>Create your account</h2>
            <p style={{ color: '#4A4A6A', fontSize: '15px' }}>Get started for free</p>
          </div>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '12px 16px', color: '#cc0000', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#f0fff8', border: '1px solid #00C6AE', borderRadius: '10px', padding: '16px', color: '#007a6a', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              ✅ Account created! Please check your email to verify.
            </div>
          )}

          {!success && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '0.2px' }}>Full Name</label>
                <input className="input-field" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e8e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#1A1A2E', transition: 'all 0.2s' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '0.2px' }}>Email address</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e8e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#1A1A2E', transition: 'all 0.2s' }} />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1A1A2E', marginBottom: '8px', letterSpacing: '0.2px' }}>Password</label>
                <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #e8e8f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fafafa', color: '#1A1A2E', transition: 'all 0.2s' }} />
              </div>

              <button className="signup-btn" onClick={handleSignup} disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#a89be0' : '#6C47FF', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(108,71,255,0.3)', letterSpacing: '0.2px' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f5' }}>
            <p style={{ color: '#4A4A6A', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#6C47FF', fontWeight: '700', textDecoration: 'none' }}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
