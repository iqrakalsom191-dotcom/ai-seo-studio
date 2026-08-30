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
  X,
} from 'lucide-react'

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-6.6L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.1L18.9 2zm-1.2 18h1.7L7.4 3.9H5.6l12.1 16.1z" />
    </svg>
  )
}

function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...props}>
      <path d="M12 .5a11.5 11.5 0 00-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0012 .5z" />
    </svg>
  )
}

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

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
  const [scrolled, setScrolled] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(false)

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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'backdrop-blur border-b' : 'border-b border-transparent'}`}
        style={{ background: scrolled ? 'rgba(9,9,11,0.9)' : 'transparent', borderColor: scrolled ? 'rgba(255,255,255,0.08)' : 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit size={20} color={COLORS.primary} />
            <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>Features</a>
            <a href="#how-it-works" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>How it works</a>
            <a href="#pricing" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg hover:text-white transition-colors duration-200"
              style={{ color: COLORS.muted }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: COLORS.primary, color: COLORS.text }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-40 pb-20 text-center">
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
                onClick={() => setShowFeatureModal(true)}
                className="p-6 rounded-xl border hover:-translate-y-2 hover:border-purple-600 transition-all duration-200 cursor-pointer"
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
              className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold border hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200"
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
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', color: COLORS.muted }}
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border border-purple-900" style={{ background: '#13102a' }}>
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
              className="px-6 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: COLORS.text, color: '#1A1A2E' }}
            >
              Start for free
            </Link>
            <button
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="px-6 py-3 rounded-lg text-sm font-semibold border hover:-translate-y-0.5 transition-all duration-200"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: COLORS.text, cursor: guestLoading ? 'not-allowed' : 'pointer' }}
            >
              {guestLoading ? 'Signing in...' : 'Try as Guest'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5" style={{ background: COLORS.bg }}>
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <BrainCircuit size={20} color={COLORS.primary} />
              <span className="font-semibold" style={{ color: COLORS.text }}>AI SEO Studio</span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: COLORS.muted }}>
              SEO content that ranks — written by AI.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: COLORS.text }}>Product</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Blog', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: COLORS.text }}>Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'Guides', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: COLORS.text }}>Company</h4>
            <ul className="space-y-3">
              {['About', 'Contact', 'Careers'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: COLORS.text }}>Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: COLORS.muted }}>
              © 2026 AI SEO Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" aria-label="Twitter" className="hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>
                <TwitterIcon />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>
                <GithubIcon />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors duration-200" style={{ color: COLORS.muted }}>
                <LinkedinIcon />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Feature Modal */}
      {showFeatureModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowFeatureModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border p-6 relative"
            style={{ background: '#13131a', borderColor: 'rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFeatureModal(false)}
              className="absolute top-4 right-4 hover:text-white transition-colors duration-200"
              style={{ color: COLORS.muted }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.text }}>
              Sign up to use this tool
            </h3>
            <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
              Create a free account or try as a guest to start using this feature.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/signup"
                className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: COLORS.primary, color: COLORS.text }}
              >
                Sign up free
              </Link>
              <button
                onClick={handleGuestLogin}
                disabled={guestLoading}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold border hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: COLORS.text, cursor: guestLoading ? 'not-allowed' : 'pointer' }}
              >
                {guestLoading ? 'Signing in...' : 'Try as Guest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
