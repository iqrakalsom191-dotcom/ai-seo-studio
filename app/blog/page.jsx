'use client'
import Link from 'next/link'
import { BrainCircuit, ArrowLeft } from 'lucide-react'

const COLORS = {
  bg: '#09090B',
  primary: '#7C3AED',
  text: '#FAFAFA',
  muted: '#999999',
}

export default function BlogPage() {
  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, minHeight: '100vh' }} className="font-sans">
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur"
        style={{ background: 'rgba(9,9,11,0.9)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit size={20} color={COLORS.primary} />
            <span className="font-bold text-lg" style={{ color: COLORS.text }}>AI SEO Studio</span>
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-40 pb-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Coming soon</h1>
        <p className="text-lg mb-10" style={{ color: COLORS.muted }}>
          We're working on SEO guides and articles. Check back soon.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:bg-purple-600 transition-all duration-200"
          style={{ background: COLORS.primary, color: COLORS.text }}
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </section>
    </div>
  )
}
