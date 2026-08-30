'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { BrainCircuit, Globe, CheckCircle2 } from 'lucide-react'

const COLORS = {
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

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 font-sans" style={{ color: COLORS.text }}>
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
        {/* Left — Branding */}
        <div className="flex flex-col flex-1 items-center lg:items-start text-center lg:text-left">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <BrainCircuit size={22} color={COLORS.primary} />
            <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Welcome back
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: COLORS.muted }}>
            Your AI-powered SEO toolkit is ready. Sign in to continue creating content that ranks.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-12 w-full">
            {STATS.map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-[#1f1f1f] text-center" style={{ background: '#111' }}>
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

        {/* Right — Form */}
        <div className="w-full max-w-lg mx-auto lg:mx-0 lg:max-w-md">
          <div className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: COLORS.text }}>Sign in to your account</h2>
              <p className="text-sm" style={{ color: COLORS.muted }}>Welcome back, let's get you in</p>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 mb-5 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
              />
            </div>

            <div className="mb-2">
              <label className="block text-xs font-semibold mb-2" style={{ color: COLORS.text }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7C3AED] text-sm transition-colors"
              />
            </div>

            <div className="text-right mb-6">
              <Link href="/forgot-password" className="text-xs font-medium hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>
                Forgot password?
              </Link>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:bg-purple-600 transition-all duration-200"
              style={{ background: loading ? '#4c2f9e' : COLORS.primary, color: COLORS.text, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center mt-6 pt-6 border-t border-[#1f1f1f]">
              <p className="text-sm" style={{ color: COLORS.muted }}>
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold hover:text-white transition-colors duration-200" style={{ color: COLORS.primary }}>Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
