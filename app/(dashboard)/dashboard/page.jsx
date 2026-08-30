'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { FileText, Key, Calendar, Flame, Sparkles, Tags, Search, ArrowRight, ArrowUpRight, Clock, Lightbulb, X, Link2, HelpCircle, Braces, ChevronRight } from 'lucide-react'

const DAILY_LIMIT = 50

const COLORS = {
  bg: '#09090B',
  card: '#111',
  border: '#1f1f1f',
  primary: '#FF6B35',
  accent: '#FFD4C2',
  text: '#FAFAFA',
  muted: '#999999',
}

const typeBadge = {
  blog:    { label: 'Blog',    bg: 'rgba(255, 107, 53,0.15)', color: '#a78bfa' },
  meta:    { label: 'Meta',    bg: 'rgba(255, 212, 194, 0.15)', color: '#FFD4C2' },
  keyword: { label: 'Keyword', bg: 'rgba(255, 212, 194, 0.15)', color: '#FFD4C2' },
}

const SEO_TIPS = [
  'Use your target keyword in the first 100 words of your blog post for better rankings.',
  'Meta descriptions do not directly affect rankings, but they improve click-through rates.',
  'Internal linking helps Google discover and index your pages faster.',
  'Page speed is a ranking factor — compress images before uploading.',
  'Long-tail keywords have less competition and higher conversion rates.',
  'Add alt text to every image — it helps both SEO and accessibility.',
  'Update old blog posts regularly — Google favors fresh content.',
  'Use H2 and H3 headings to structure your content for both readers and crawlers.',
  'A URL slug should be short, descriptive, and include the target keyword.',
  'Backlinks from high-authority sites are still one of the strongest ranking signals.',
  'Mobile-first indexing means your mobile site is what Google primarily evaluates.',
  'Schema markup helps search engines understand your content and can trigger rich snippets.',
  'Dwell time matters — write engaging intros so users do not bounce immediately.',
  'Canonical tags prevent duplicate content issues across similar pages.',
  'Google Search Console is free and gives you direct data about your rankings.',
  'Featured snippets can be won by directly answering common questions in your content.',
  'Use LSI keywords naturally throughout your content to improve topical relevance.',
  'A sitemap.xml helps search engines crawl your site more efficiently.',
  'Social signals do not directly affect SEO, but they increase content visibility.',
  'Title tags should be unique on every page and under 60 characters.',
  'Core Web Vitals — LCP, FID, CLS — directly impact your Google rankings.',
  'Pillar pages and topic clusters help establish topical authority in your niche.',
]

function parseMarkdownLines(content) {
  return (content || '').split('\n').map((raw) => {
    const line = raw.trim()
    if (!line) return { type: 'blank', text: '' }
    if (line.startsWith('###')) return { type: 'h3', text: line.replace(/^#{3}\s*/, '') }
    if (line.startsWith('##')) return { type: 'h2', text: line.replace(/^#{2}\s*/, '') }
    if (line.startsWith('---')) return { type: 'hr', text: '' }
    if (line.startsWith('* ')) return { type: 'bullet', text: line.replace(/^\*\s*/, '') }
    if (line.startsWith('**') && line.endsWith('**') && line.length > 3) {
      return { type: 'bold', text: line.replace(/^\*\*|\*\*$/g, '') }
    }
    return { type: 'paragraph', text: line }
  })
}

function MarkdownPreview({ content }) {
  const lines = parseMarkdownLines(content)
  return (
    <div>
      {lines.map((line, idx) => {
        switch (line.type) {
          case 'h3':
            return <h3 key={idx} style={{ color: '#FF6B35', fontSize: '18px', fontWeight: 700, margin: '16px 0 8px' }}>{line.text}</h3>
          case 'h2':
            return <h2 key={idx} style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 700, margin: '16px 0 8px' }}>{line.text}</h2>
          case 'bold':
            return <p key={idx} style={{ color: '#FAFAFA', fontWeight: 700, margin: '4px 0' }}>{line.text}</p>
          case 'bullet':
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0', color: '#999999', lineHeight: 1.7 }}>
                <span style={{ color: '#FFD4C2', marginTop: '2px' }}>●</span>
                <span>{line.text}</span>
              </div>
            )
          case 'hr':
            return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #1f1f1f', margin: '12px 0' }} />
          case 'blank':
            return <div key={idx} style={{ height: '8px' }} />
          default:
            return <p key={idx} style={{ color: '#999999', lineHeight: 1.7, margin: '4px 0' }}>{line.text}</p>
        }
      })}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ total: 0, keywords: 0, thisWeek: 0, streak: 0 })
  const [recent, setRecent] = useState([])
  const [breakdown, setBreakdown] = useState({ blog: 0, meta: 0, keyword: 0 })
  const [topKeywords, setTopKeywords] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [allData, setAllData] = useState([])
  const [modal, setModal] = useState(null)
  const [tip, setTip] = useState(SEO_TIPS[0])
  const [todayCount, setTodayCount] = useState(0)

  useEffect(() => {
    setTip(SEO_TIPS[Math.floor(Math.random() * SEO_TIPS.length)])
  }, [])

  const processData = useCallback((data) => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const total = data.length
    const keywords = data.filter(r => r.type === 'keyword').length
    const thisWeek = data.filter(r => new Date(r.created_at) >= weekAgo).length
    const days = new Set(data.map(r => new Date(r.created_at).toDateString()))
    let streak = 0
    const check = new Date()
    while (days.has(check.toDateString())) { streak++; check.setDate(check.getDate() - 1) }
    setStats({ total, keywords, thisWeek, streak })
    setRecent(data.slice(0, 5))
    setBreakdown({
      blog:    data.filter(r => r.type === 'blog').length,
      meta:    data.filter(r => r.type === 'meta').length,
      keyword: data.filter(r => r.type === 'keyword').length,
    })
    setTopKeywords(data.filter(r => r.type === 'keyword').slice(0, 5))
    setTodayCount(data.filter(r => new Date(r.created_at).toDateString() === now.toDateString()).length)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.push('/login')
      setUser(user)
      const { data, error } = await supabase
        .from('saved_content')
        .select('id, title, type, keyword, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error || !data) { if (error) toast.error('Failed to load dashboard data'); return }
      setAllData(data)
      processData(data)
    })
  }, [])

  const applyFilter = () => {
    let filtered = allData
    if (fromDate) filtered = filtered.filter(r => new Date(r.created_at) >= new Date(fromDate))
    if (toDate) { const to = new Date(toDate); to.setHours(23,59,59); filtered = filtered.filter(r => new Date(r.created_at) <= to) }
    processData(filtered)
  }

  const resetFilter = () => {
    setFromDate('')
    setToDate('')
    processData(allData)
  }

  const statCards = [
    { label: 'Total Content',  value: stats.total,            icon: FileText, trend: '+12%', href: '/library',              color: COLORS.primary },
    { label: 'Keywords Saved', value: stats.keywords,         icon: Key,      trend: '+8%',  href: '/library?type=keyword', color: COLORS.primary },
    { label: 'This Week',      value: stats.thisWeek,         icon: Calendar, trend: '+24%', href: '/library',              color: COLORS.accent },
    { label: 'Streak',         value: stats.streak + ' days', icon: Flame,    trend: null,   href: null,                    color: '#10b981' },
  ]

  const actions = [
    { label: 'Generate Blog',    desc: 'AI-powered blog post from a keyword', icon: Sparkles, href: '/generator', color: COLORS.primary },
    { label: 'Create Meta Tags', desc: 'SEO title & description generator',   icon: Tags,     href: '/meta',      color: COLORS.accent },
    { label: 'Analyze Keyword',  desc: 'Intent, difficulty & suggestions',    icon: Search,   href: '/keywords',  color: '#10b981' },
  ]

  const tools = [
    { label: 'Blog Generator',  icon: Sparkles,   href: '/generator' },
    { label: 'Meta Tags',       icon: Tags,       href: '/meta' },
    { label: 'Keywords',        icon: Search,     href: '/keywords' },
    { label: 'Slug Generator',  icon: Link2,       href: '/slug' },
    { label: 'FAQ Generator',   icon: HelpCircle, href: '/faq' },
    { label: 'Schema Markup',   icon: Braces,     href: '/schema' },
  ]

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const usagePct = Math.min(100, Math.round((todayCount / DAILY_LIMIT) * 100))
  const usageWarning = todayCount > 40

  return (
    <div className="p-6 md:p-8" style={{ background: COLORS.bg, minHeight: '100vh' }}>
    <div className="max-w-7xl w-full">
      <style>{`
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255, 107, 53,0.15) !important; }
        .stat-card { transition: all 0.2s ease; }
        .action-card:hover { transform: translateY(-4px); }
        .action-card { transition: all 0.2s ease; }
        .tool-card:hover { transform: translateY(-2px); border-color: #FF6B35 !important; box-shadow: 0 8px 20px rgba(255, 107, 53,0.15) !important; }
        .tool-card { transition: all 0.2s ease; }
        .activity-row:hover { background: rgba(255, 107, 53,0.08) !important; cursor: pointer; }
        .activity-row:hover .activity-arrow { opacity: 1 !important; transform: translateX(2px); }
        .activity-row { transition: background 0.15s ease; }
        .activity-arrow { transition: all 0.15s ease; }
        .cta-btn:hover { background: #6b2fe0 !important; transform: translateY(-1px); }
        .cta-btn { transition: all 0.2s ease; }
      `}</style>

      {/* Content Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setModal(null)}>
          <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '20px', maxWidth: '640px', width: '100%', height: '80vh', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, background: '#111111', zIndex: 10, padding: '16px 24px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', flexShrink: 0, background: typeBadge[modal.type]?.bg || '#1a1a1a', color: typeBadge[modal.type]?.color || '#999999' }}>
                  {typeBadge[modal.type]?.label || modal.type}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FAFAFA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modal.title}</h3>
              </div>
              <button onClick={() => setModal(null)} style={{ background: '#1a1a1a', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '12px' }}>
                <X size={16} color="#999999" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              <MarkdownPreview content={modal.content} />
            </div>

            <div style={{ position: 'sticky', bottom: 0, background: '#111111', zIndex: 10, padding: '16px 24px', borderTop: '1px solid #1f1f1f', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '10px 24px', borderRadius: '10px', background: COLORS.primary, color: '#fff', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Mode Banner */}
      {user?.is_anonymous && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', background: '#1a1a1a', border: '1px solid #6b21a8', borderRadius: '14px', padding: '16px 24px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text, margin: 0 }}>
            You are using Guest Mode — your data won't be saved. Sign up free to save your work!
          </p>
          <Link href="/signup"
            style={{ flexShrink: 0, padding: '10px 20px', borderRadius: '10px', background: COLORS.primary, color: '#fff', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
            Sign Up Free
          </Link>
        </div>
      )}

      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Welcome back</p>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: COLORS.text, letterSpacing: '-0.8px', marginBottom: '8px' }}>
            {user?.user_metadata?.full_name || 'There'} 👋
          </h1>
          <p style={{ fontSize: '16px', color: COLORS.muted }}>Here's what's happening with your SEO content today.</p>
        </div>
        <Link href="/generator" className="cta-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '12px', background: COLORS.primary, color: '#fff', fontSize: '15px', fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>
          <Sparkles size={18} />
          Generate Content
        </Link>
      </div>

      {/* Date Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
          style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: COLORS.text, outline: 'none' }} />
        <span style={{ fontSize: '13px', color: COLORS.muted }}>to</span>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
          style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: COLORS.text, outline: 'none' }} />
        <button onClick={applyFilter} style={{ padding: '8px 18px', borderRadius: '10px', background: COLORS.primary, color: '#fff', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Filter</button>
        <button onClick={resetFilter} style={{ padding: '8px 18px', borderRadius: '10px', background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.muted, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Reset</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {statCards.map(({ label, value, icon: Icon, trend, href, color }) => {
          const inner = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color }} />
                </div>
                {trend && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '700', color: COLORS.accent }}>
                    <ArrowUpRight size={12} />
                    {trend}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color, letterSpacing: '-0.5px', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: COLORS.text, fontWeight: '500' }}>{label}</div>
            </>
          )
          const style = { background: COLORS.card, borderRadius: '16px', padding: '24px', border: `1px solid ${COLORS.border}`, textDecoration: 'none', display: 'block' }
          return href
            ? <Link key={label} href={href} className="stat-card" style={style}>{inner}</Link>
            : <div key={label} className="stat-card" style={style}>{inner}</div>
        })}
      </div>

      {/* Usage Progress */}
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '20px 24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text }}>Daily Usage</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: usageWarning ? COLORS.accent : COLORS.primary }}>
            {todayCount} / {DAILY_LIMIT} daily generations used
          </span>
        </div>
        <div className="w-full bg-[#1f1f1f] rounded-full h-2 mt-3">
          <div
            className="bg-[#FF6B35] h-2 rounded-full transition-all"
            style={{ width: `${Math.min((todayCount / 50) * 100, 100)}%`, background: usageWarning ? COLORS.accent : COLORS.primary }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
          {actions.map(({ label, desc, icon: Icon, href, color }) => (
            <Link key={href} href={href} className="action-card"
              style={{ textDecoration: 'none', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${color}`, borderRadius: '18px', padding: '28px', display: 'block', minHeight: '160px' }}>
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${color}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon size={26} style={{ color }} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: COLORS.text, marginBottom: '6px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: COLORS.muted, lineHeight: '1.5' }}>{desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color }}>
                  Get started <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div style={{ marginBottom: '40px' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" style={{ gap: '14px' }}>
          {tools.map(({ label, icon: Icon, href }) => (
            <Link key={href} href={href} className="tool-card hover:bg-[#1a1a1a] min-h-[100px] flex flex-col items-center justify-center gap-2"
              style={{ textDecoration: 'none', background: COLORS.card, borderRadius: '14px', padding: '18px 12px', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color: COLORS.primary }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.text }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Breakdown */}
      <div style={{ marginBottom: '40px' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Content Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
          {[
            { label: 'Blog Posts', count: breakdown.blog,    color: COLORS.primary },
            { label: 'Meta Tags',  count: breakdown.meta,    color: COLORS.accent },
            { label: 'Keywords',   count: breakdown.keyword, color: '#10b981' },
          ].map(({ label, count, color }) => {
            const total = breakdown.blog + breakdown.meta + breakdown.keyword || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={label} style={{ background: COLORS.card, borderRadius: '16px', padding: '24px', border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.muted }}>{label}</span>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: `${color}26`, color }}>{count}</span>
                </div>
                <div style={{ height: '8px', borderRadius: '99px', background: '#1a1a1a', overflow: 'hidden' }}>
                  <div style={{ height: '8px', borderRadius: '99px', background: color, width: pct + '%', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: COLORS.muted, marginTop: '6px' }}>{pct}% of total</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Keywords + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '20px', marginBottom: '40px' }}>
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Top Keywords</h2>
          <div style={{ background: COLORS.card, borderRadius: '16px', border: `1px solid ${COLORS.border}`, padding: '20px', minHeight: '100px' }}>
            {topKeywords.length === 0
              ? <p style={{ fontSize: '13px', color: COLORS.muted, textAlign: 'center', padding: '24px 0' }}>No keywords saved yet</p>
              : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {topKeywords.map((item) => (
                    <span key={item.id} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: 'rgba(255, 212, 194, 0.12)', color: COLORS.accent, border: '1px solid rgba(255, 212, 194, 0.25)' }}>
                      {item.keyword || item.title}
                    </span>
                  ))}
                </div>
            }
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div style={{ background: COLORS.card, borderRadius: '16px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            {recent.length === 0 ? (
              <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255, 107, 53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Clock size={24} style={{ color: COLORS.primary }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: COLORS.text, marginBottom: '6px' }}>No activity yet</div>
                <div style={{ fontSize: '13px', color: COLORS.muted }}>Your generated content will appear here</div>
              </div>
            ) : (
              <div>
                {recent.map((item, i) => {
                  const badge = typeBadge[item.type] || { label: item.type, bg: '#1a1a1a', color: COLORS.muted }
                  return (
                    <div key={item.id} className="activity-row"
                      onClick={() => setModal(item)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < recent.length - 1 ? `1px solid ${COLORS.border}` : 'none', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: badge.bg, color: badge.color, flexShrink: 0 }}>{badge.label}</span>
                        <span style={{ fontSize: '13px', color: COLORS.text, fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: COLORS.muted, flexShrink: 0 }}>{formatDate(item.created_at)}</span>
                      <ChevronRight size={15} className="activity-arrow" style={{ color: COLORS.primary, flexShrink: 0, opacity: 0.5 }} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Tip */}
      <div className="border-l-4 border-amber-500" style={{ background: '#1a1a1a', borderTop: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 212, 194, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lightbulb size={18} style={{ color: COLORS.accent }} />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>SEO Tip of the Day</div>
          <div style={{ fontSize: '14px', color: COLORS.text, lineHeight: '1.6' }}>{tip}</div>
        </div>
      </div>
    </div>
    </div>
  )
}
