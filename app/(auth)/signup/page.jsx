'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { BrainCircuit, Globe, CheckCircle2 } from 'lucide-react'

const COLORS = {
  bg: '#09090B',
  primary: '#7C3AED',
  accent: '#F59E0B',
  text: '#FAFAFA',
  muted: '#999999',
}

const STATS = [
  { value: '10x', label: 'Faster Content' },
  { value: '17+', label: 'AI Tools' },
  { value: 'Free', label: 'to Start' },
]

const CAPABILITIES = [
  'Generate full blog posts in seconds',
  'Publish directly to WordPress',
  'Analyze keywords and search intent',
  'Create meta tags automatically',
]

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)

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

  async function handleGuestLogin() {
    setGuestLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      setError(error.message)
      setGuestLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text }} className="font-sans min-h-screen flex items-center justify-center py-12">
    <div className="w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left — Branding */}
      <div className="flex flex-col justify-center px-8 sm:px-16 py-16">
        <div className="max-w-md mx-auto md:mx-0 w-full">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <BrainCircuit size={22} color={COLORS.primary} />
            <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Start ranking today
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: COLORS.muted }}>
            Generate SEO content, publish to WordPress, and grow your traffic — all with AI.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-12">
            {STATS.map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-[#1f1f1f] text-center" style={{ background: '#111', borderColor: '#1f1f1f' }}>
                <div className="text-2xl font-extrabold" style={{ color: COLORS.accent }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: COLORS.text }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h3 className="text-sm font-semibold mb-4" style={{ color: COLORS.text }}>What you can do</h3>
            <div className="flex flex-col gap-4">
              {CAPABILITIES.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <CheckCircle2 size={18} color={COLORS.primary} className="shrink-0" />
                  <span className="text-sm" style={{ color: COLORS.text }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe size={16} color={COLORS.muted} />
            <span className="text-sm" style={{ color: COLORS.muted }}>Trusted by freelancers worldwide</span>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col justify-center items-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border p-8" style={{ background: '#111', borderColor: '#1f1f1f' }}>
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: COLORS.text }}>Create your account</h2>
            <p className="text-sm" style={{ color: COLORS.muted }}>Get started for free</p>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-5 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg px-4 py-4 mb-5 text-sm text-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: COLORS.text }}>
              Account created! Please check your email to verify.
            </div>
          )}

          {!success && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:border-purple-600 transition-colors"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: COLORS.text }}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:border-purple-600 transition-colors"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: COLORS.text }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:border-purple-600 transition-colors"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: COLORS.text }}
                />
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:bg-purple-600 transition-all duration-200"
                style={{ background: loading ? '#4c2f9e' : COLORS.primary, color: COLORS.text, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="w-full py-3 rounded-lg text-sm font-semibold border mt-4 hover:-translate-y-0.5 hover:border-white hover:text-white transition-all duration-200"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: COLORS.text, cursor: guestLoading ? 'not-allowed' : 'pointer' }}
          >
            {guestLoading ? 'Signing in...' : 'Try as Guest'}
          </button>

          <div className="text-center mt-6 pt-6 border-t" style={{ borderColor: '#1f1f1f' }}>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold hover:text-white transition-colors duration-200" style={{ color: COLORS.primary }}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
