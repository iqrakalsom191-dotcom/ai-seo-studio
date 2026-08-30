'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { BrainCircuit, CheckCircle2, Star } from 'lucide-react'

const COLORS = {
  bg: '#09090B',
  primary: '#7C3AED',
  accent: '#F59E0B',
  text: '#FAFAFA',
  muted: '#999999',
}

const BULLETS = [
  'AI-powered blog generation in seconds',
  'Smart keyword research & suggestions',
  'One-click WordPress publishing',
  'SEO meta tags, generated automatically',
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
    <div style={{ background: COLORS.bg, color: COLORS.text, minHeight: '100vh' }} className="font-sans grid grid-cols-1 md:grid-cols-2">
      {/* Left — Branding */}
      <div className="hidden md:flex flex-col justify-center px-16 py-16">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <BrainCircuit size={22} color={COLORS.primary} />
            <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Welcome back
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: COLORS.muted }}>
            Sign in to continue creating SEO content that ranks — powered by AI.
          </p>

          <div className="flex flex-col gap-4 mb-12">
            {BULLETS.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 size={18} color={COLORS.primary} className="shrink-0" />
                <span className="text-sm" style={{ color: COLORS.text }}>{b}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl border" style={{ background: '#111', borderColor: '#1f1f1f' }}>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} color={COLORS.accent} fill={COLORS.accent} />
              ))}
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.text }}>
              "The keyword research tool alone is worth it. I use it for every blog brief I write now."
            </p>
            <div>
              <div className="text-sm font-semibold" style={{ color: COLORS.text }}>Rohan Mehta</div>
              <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>Content Strategist, Mumbai</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col justify-center items-center px-6 py-16">
        <Link href="/" className="flex md:hidden items-center gap-2 mb-8">
          <BrainCircuit size={20} color={COLORS.primary} />
          <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
        </Link>

        <div className="w-full max-w-md rounded-2xl border p-8" style={{ background: '#111', borderColor: '#1f1f1f' }}>
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
              className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:border-purple-600 transition-colors"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: COLORS.text }}
            />
          </div>

          <div className="mb-2">
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

          <div className="text-center mt-6 pt-6 border-t" style={{ borderColor: '#1f1f1f' }}>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold hover:text-white transition-colors duration-200" style={{ color: COLORS.primary }}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
