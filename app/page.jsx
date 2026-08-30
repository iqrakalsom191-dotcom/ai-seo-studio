'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  BrainCircuit,
  Sparkles,
  PenLine,
  Search,
  Wand2,
  Globe,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

const COLORS = {
  bg: '#09090B',
  primary: '#7C3AED',
  accent: '#F59E0B',
  text: '#FAFAFA',
  muted: '#999999',
}

const FEATURES = [
  {
    icon: PenLine,
    title: 'AI Content Generation',
    desc: 'Generate SEO-optimized blog posts, articles, and copy in seconds with advanced AI models.',
  },
  {
    icon: Search,
    title: 'Keyword Research',
    desc: 'Discover high-value keywords and understand search intent to target the right audience.',
  },
  {
    icon: Wand2,
    title: 'Smart Meta Tags',
    desc: 'Auto-generate meta titles and descriptions that boost click-through rates.',
  },
  {
    icon: Globe,
    title: 'WordPress Integration',
    desc: 'Publish directly to WordPress with a single click — no copy-pasting required.',
  },
  {
    icon: BarChart3,
    title: 'Performance Tracking',
    desc: 'Monitor rankings, traffic, and content performance from a unified dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Plagiarism Free',
    desc: 'Every piece of content is checked for originality before it reaches your site.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Describe your topic',
    desc: 'Tell us what you want to write about, your target keyword, and your audience.',
  },
  {
    step: '02',
    title: 'AI generates content',
    desc: 'Our AI writes SEO-optimized content tailored to rank for your target keywords.',
  },
  {
    step: '03',
    title: 'Publish & rank',
    desc: 'Review, edit, and publish directly to your site — then watch your rankings climb.',
  },
]

const STATS = [
  { value: '10x', label: 'Faster' },
  { value: '17+', label: 'AI Tools' },
  { value: '99%', label: 'Uptime' },
  { value: 'Free', label: 'to start' },
]

export default function Home() {
  const router = useRouter()
  const [guestLoading, setGuestLoading] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.is_anonymous) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [router])

  async function handleGuestLogin() {
    setGuestLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      setGuestLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, minHeight: '100vh' }} className="font-sans">
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur"
        style={{ background: 'rgba(9,9,11,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit size={20} color={COLORS.primary} />
            <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-white transition-colors" style={{ color: COLORS.muted }}>Features</a>
            <a href="#how-it-works" className="text-sm hover:text-white transition-colors" style={{ color: COLORS.muted }}>How it works</a>
            <a href="#pricing" className="text-sm hover:text-white transition-colors" style={{ color: COLORS.muted }}>Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg hover:text-white transition-colors"
              style={{ color: COLORS.muted }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: COLORS.primary, color: COLORS.text }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: COLORS.primary }}
        >
          <Sparkles size={14} />
          Powered by Groq AI
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          SEO content that ranks —<br />
          <span style={{ color: COLORS.accent }}>written by AI</span>
        </h1>

        <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: COLORS.muted }}>
          Generate SEO-optimized blog posts, meta tags, and keyword strategies in seconds.
          Skip the writer's block and start ranking today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: COLORS.primary, color: COLORS.text }}
          >
            Start for free
            <ArrowRight size={16} />
          </Link>
          <button
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: COLORS.text, cursor: guestLoading ? 'not-allowed' : 'pointer' }}
          >
            {guestLoading ? 'Signing in...' : 'Try as Guest'}
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold" style={{ color: COLORS.accent }}>{s.value}</div>
              <div className="text-sm mt-1" style={{ color: COLORS.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything you need to rank</h2>
          <p style={{ color: COLORS.muted }}>A complete SEO toolkit powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="p-6 rounded-xl border transition-colors hover:border-white/20"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(124,58,237,0.1)' }}
                >
                  <Icon size={20} color={COLORS.primary} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.text }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How it works</h2>
          <p style={{ color: COLORS.muted }}>Three simple steps to better rankings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold mb-4"
                style={{ background: COLORS.primary, color: COLORS.text }}
              >
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Simple, transparent pricing</h2>
          <p style={{ color: COLORS.muted }}>Start free, upgrade when you need more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div
            className="p-8 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <h3 className="font-semibold text-lg mb-1">Free</h3>
            <p className="text-sm mb-6" style={{ color: COLORS.muted }}>For getting started</p>
            <div className="text-4xl font-extrabold mb-6">$0</div>
            <Link
              href="/signup"
              className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: COLORS.text }}
            >
              Start Free
            </Link>
          </div>

          <div
            className="p-8 rounded-xl border relative"
            style={{ background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
          >
            <span
              className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: COLORS.accent }}
            >
              Coming soon
            </span>
            <h3 className="font-semibold text-lg mb-1">Pro</h3>
            <p className="text-sm mb-6" style={{ color: COLORS.muted }}>For teams and power users</p>
            <div className="text-4xl font-extrabold mb-6">—</div>
            <button
              disabled
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.05)', color: COLORS.muted }}
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24" style={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 60%, #7C3AED 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: COLORS.text }}>
            Ready to start ranking?
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Join creators and marketers using AI to write content that ranks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: COLORS.text, color: '#1A1A2E' }}
            >
              Start for free
            </Link>
            <button
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="px-6 py-3 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: COLORS.text, cursor: guestLoading ? 'not-allowed' : 'pointer' }}
            >
              {guestLoading ? 'Signing in...' : 'Try as Guest'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit size={18} color={COLORS.primary} />
            <span className="font-semibold" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>

          <p className="text-sm" style={{ color: COLORS.muted }}>
            © {new Date().getFullYear()} AI SEO Studio. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-white transition-colors" style={{ color: COLORS.muted }}>Features</a>
            <a href="#pricing" className="text-sm hover:text-white transition-colors" style={{ color: COLORS.muted }}>Pricing</a>
            <Link href="/login" className="text-sm hover:text-white transition-colors" style={{ color: COLORS.muted }}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
