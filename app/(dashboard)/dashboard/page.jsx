'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { FileText, Key, Calendar, Flame, Sparkles, Tags, Search, ArrowRight, Clock, Lightbulb, X } from 'lucide-react'

const typeBadge = {
  blog:    { label: 'Blog',    bg: 'rgba(108,71,255,0.12)', color: '#6C47FF' },
  meta:    { label: 'Meta',    bg: 'rgba(0,198,174,0.12)',  color: '#00957f' },
  keyword: { label: 'Keyword', bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
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
  const [tip] = useState(() => SEO_TIPS[Math.floor(Math.random() * SEO_TIPS.length)])

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
    { label: 'Total Content',  value: stats.total,            icon: FileText, color: '#6C47FF', bg: 'rgba(108,71,255,0.12)', href: '/library' },
    { label: 'Keywords Saved', value: stats.keywords,         icon: Key,      color: '#00C6AE', bg: 'rgba(0,198,174,0.12)',  href: '/library?type=keyword' },
    { label: 'This Week',      value: stats.thisWeek,         icon: Calendar, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',href: '/library' },
    { label: 'Streak',         value: stats.streak + ' days', icon: Flame,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', href: null },
  ]

  const actions = [
    { label: 'Generate Blog',    desc: 'AI-powered blog post from a keyword', icon: Sparkles, href: '/generator' },
    { label: 'Create Meta Tags', desc: 'SEO title & description generator',   icon: Tags,     href: '/meta'      },
    { label: 'Analyze Keyword',  desc: 'Intent, difficulty & suggestions',    icon: Search,   href: '/keywords'  },
  ]

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const cardStyle = { background: 'var(--card-bg)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textDecoration: 'none', display: 'block' }

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px' }}>
      <style>{`
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(108,71,255,0.10) !important; }
        .stat-card { transition: all 0.2s ease; }
        .action-card:hover { transform: translateY(-2px); border-color: #6C47FF !important; box-shadow: 0 8px 24px rgba(108,71,255,0.12) !important; }
        .action-card { transition: all 0.2s ease; }
        .activity-row:hover { background: rgba(108,71,255,0.04) !important; cursor: pointer; }
        .activity-row { transition: background 0.15s ease; }
      `}</style>

      {/* Content Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setModal(null)}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '20px', padding: '32px', maxWidth: '640px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: typeBadge[modal.type]?.bg || 'var(--subtle-bg)', color: typeBadge[modal.type]?.color || '#6b7280' }}>
                  {typeBadge[modal.type]?.label || modal.type}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{modal.title}</h3>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'var(--subtle-bg)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#6b7280" />
              </button>
            </div>
            <textarea
              readOnly
              value={modal.content || ''}
              style={{ width: '100%', minHeight: '300px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', fontSize: '13px', lineHeight: '1.7', color: 'var(--text-primary)', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#6C47FF', color: '#fff', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '14px', color: '#00C6AE', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Welcome back</p>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: '8px' }}>
          {user?.user_metadata?.full_name || 'There'} 👋
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Here's what's happening with your SEO content today.</p>
      </div>

      {/* Date Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
          style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} />
        <span style={{ fontSize: '13px', color: '#9ca3af' }}>to</span>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
          style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} />
        <button onClick={applyFilter} style={{ padding: '8px 18px', borderRadius: '10px', background: '#6C47FF', color: '#fff', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Filter</button>
        <button onClick={resetFilter} style={{ padding: '8px 18px', borderRadius: '10px', background: 'var(--subtle-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Reset</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => {
          const inner = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color }} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
            </>
          )
          return href
            ? <Link key={label} href={href} className="stat-card" style={cardStyle}>{inner}</Link>
            : <div key={label} className="stat-card" style={cardStyle}>{inner}</div>
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.3px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {actions.map(({ label, desc, icon: Icon, href }) => (
            <Link key={href} href={href} className="action-card" style={{ textDecoration: 'none', background: 'var(--card-bg)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'block' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C47FF, #00C6AE)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(108,71,255,0.3)' }}>
                <Icon size={20} style={{ color: '#fff' }} />
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>{desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#6C47FF' }}>
                Get started <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Breakdown */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.3px' }}>Content Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Blog Posts', count: breakdown.blog,    bg: 'rgba(108,71,255,0.08)', color: '#6C47FF', bar: '#6C47FF' },
            { label: 'Meta Tags',  count: breakdown.meta,    bg: 'rgba(0,198,174,0.08)',  color: '#00957f', bar: '#00C6AE' },
            { label: 'Keywords',   count: breakdown.keyword, bg: 'rgba(245,158,11,0.08)', color: '#b45309', bar: '#f59e0b' },
          ].map(({ label, count, bg, color, bar }) => {
            const total = breakdown.blog + breakdown.meta + breakdown.keyword || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={label} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: bg, color }}>{count}</span>
                </div>
                <div style={{ height: '6px', borderRadius: '99px', background: 'var(--subtle-bg)' }}>
                  <div style={{ height: '6px', borderRadius: '99px', background: bar, width: pct + '%', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>{pct}% of total</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Keywords + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.3px' }}>Top Keywords</h2>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', padding: '20px', minHeight: '100px' }}>
            {topKeywords.length === 0
              ? <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No keywords saved yet</p>
              : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {topKeywords.map((item) => (
                    <span key={item.id} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: 'rgba(0,198,174,0.10)', color: '#00957f', border: '1px solid rgba(0,198,174,0.2)' }}>
                      {item.keyword || item.title}
                    </span>
                  ))}
                </div>
            }
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.3px' }}>Recent Activity</h2>
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            {recent.length === 0 ? (
              <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(108,71,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Clock size={24} style={{ color: '#6C47FF' }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No activity yet</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your generated content will appear here</div>
              </div>
            ) : (
              <div>
                {recent.map((item, i) => {
                  const badge = typeBadge[item.type] || { label: item.type, bg: 'var(--subtle-bg)', color: '#6b7280' }
                  return (
                    <div key={item.id} className="activity-row"
                      onClick={() => setModal(item)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < recent.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', background: badge.bg, color: badge.color, flexShrink: 0 }}>{badge.label}</span>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, marginLeft: '12px' }}>{formatDate(item.created_at)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Tip */}
      <div style={{ background: 'linear-gradient(135deg, rgba(108,71,255,0.06), rgba(0,198,174,0.06))', borderRadius: '16px', padding: '24px', border: '1px solid rgba(108,71,255,0.12)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C47FF, #00C6AE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lightbulb size={18} style={{ color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6C47FF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>SEO Tip of the Day</div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{tip}</div>
        </div>
      </div>
    </div>
  )
}
