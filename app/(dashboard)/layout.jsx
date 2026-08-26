'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard,
  Sparkles,
  Tags,
  Search,
  BookOpen,
  Settings,
  LogOut,
  Wand2,
  BookOpenCheck,
  Link2,
  Type,
  HelpCircle,
  Share2,
  CalendarDays,
  Braces,
  Sun,
  Moon,
  FileText,
  Globe,
  Gauge,
  ChevronDown
} from 'lucide-react'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { label: 'Blog Generator', href: '/generator', icon: Sparkles },
      { label: 'Meta Tags', href: '/meta', icon: Tags },
      { label: 'Keyword Analyzer', href: '/keywords', icon: Search },
      { label: 'Content Improver', href: '/improver', icon: Wand2 },
      { label: 'Readability Score', href: '/readability', icon: BookOpenCheck },
      { label: 'Title Generator', href: '/title-generator', icon: Type },
      { label: 'Word Count & SEO', href: '/word-count', icon: FileText },
      { label: 'Internal Links', href: '/internal-links', icon: Link2 },
      { label: 'Competitor Meta', href: '/competitor-meta', icon: Globe },
    ],
  },
  {
    label: 'Generators',
    items: [
      { label: 'Slug Generator', href: '/slug', icon: Link2 },
      { label: 'FAQ Generator', href: '/faq', icon: HelpCircle },
      { label: 'Social Captions', href: '/social', icon: Share2 },
      { label: 'Schema Markup', href: '/schema', icon: Braces },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Library', href: '/library', icon: BookOpen },
      { label: 'Content Calendar', href: '/calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Usage', href: '/usage', icon: Gauge },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(navGroups.map(({ label }) => [label, label === 'Overview']))
  )
  const [hoveredGroup, setHoveredGroup] = useState(null)
  const [flyout, setFlyout] = useState(null)
  const flyoutTimeoutRef = useRef(null)

  const toggleGroup = (label) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))

  const openFlyout = (groupKey, e) => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current)
      flyoutTimeoutRef.current = null
    }
    const top = e.currentTarget.getBoundingClientRect().top
    setFlyout({ groupKey, top })
  }

  const scheduleCloseFlyout = () => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyout(null)
    }, 200)
  }

  const cancelCloseFlyout = () => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current)
      flyoutTimeoutRef.current = null
    }
  }

  const closeFlyoutImmediately = () => {
    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current)
      flyoutTimeoutRef.current = null
    }
    setFlyout(null)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .nav-link:hover { background: rgba(108,71,255,0.15) !important; color: #fff !important; backdrop-filter: blur(10px); }
        .nav-link:hover svg { color: #00C6AE !important; }
        .logout-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
        .nav-link { transition: all 150ms ease !important; }
        .logout-btn { transition: all 0.18s ease !important; }
        .nav-group-toggle:hover { background: rgba(108,71,255,0.15) !important; color: #fff !important; }
        .nav-group-toggle { transition: all 150ms ease !important; }
        .nav-group-chevron { transition: transform 0.25s ease !important; }
        .nav-group-body { transition: grid-template-rows 0.25s ease !important; display: grid; overflow: hidden; }
        .nav-group-body[data-open="false"] { height: 0; overflow: hidden; visibility: hidden; }
        .flyout-link:hover { background: rgba(108,71,255,0.2) !important; color: #fff !important; }
        .flyout-link { transition: all 150ms ease !important; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: '260px', height: '100vh', background: '#0F0F0F',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, zIndex: 100, overflowY: 'auto',
        borderRight: '1px solid rgba(108,71,255,0.25)',
        boxShadow: '4px 0 24px rgba(108,71,255,0.08)'
      }}>

        {/* Logo */}
        <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #6C47FF, #00C6AE)',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px',
              boxShadow: '0 4px 12px rgba(108,71,255,0.4)'
            }}>🔍</div>
            <span style={{
              fontSize: '16px', fontWeight: '800', letterSpacing: '-0.4px',
              background: 'linear-gradient(90deg, #fff 0%, #a89be0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>AI SEO Studio</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {navGroups.map(({ label: groupLabel, items }) => {
            const isOpen = !!expanded[groupLabel]
            const hasActiveChild = items.some(({ href }) =>
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            )
            return (
              <div key={groupLabel} style={{ position: 'relative' }}>
                <button
                  className="nav-group-toggle"
                  onClick={() => toggleGroup(groupLabel)}
                  onMouseEnter={(e) => {
                    setHoveredGroup(groupLabel)
                    if (!isOpen) openFlyout(groupLabel, e)
                  }}
                  onMouseLeave={() => {
                    setHoveredGroup(null)
                    scheduleCloseFlyout()
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: hasActiveChild ? 'rgba(108,71,255,0.1)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    borderLeft: hasActiveChild ? '3px solid #6C47FF' : '3px solid transparent',
                    fontSize: '14px', fontWeight: '600', letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#aaaaaa',
                    padding: '8px 14px', borderRadius: '8px',
                  }}
                >
                  {groupLabel}
                  <ChevronDown
                    size={14}
                    className="nav-group-chevron"
                    style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}
                  />
                </button>
                {hoveredGroup === groupLabel && isOpen && (
                  <div style={{
                    position: 'absolute', left: '100%', top: '4px', marginLeft: '8px',
                    background: '#1a1a1a', border: '1px solid #333', color: 'white',
                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                    whiteSpace: 'nowrap', zIndex: 200, pointerEvents: 'none'
                  }}>
                    {groupLabel}
                  </div>
                )}
                {flyout && flyout.groupKey === groupLabel && !isOpen && (
                  <div
                    onMouseEnter={cancelCloseFlyout}
                    onMouseLeave={closeFlyoutImmediately}
                    style={{
                      position: 'fixed', left: '260px', top: flyout.top,
                      background: '#1a1a1a', border: '1px solid #444',
                      borderRadius: '8px', padding: '8px', minWidth: '180px',
                      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '2px'
                    }}
                  >
                    <div style={{
                      fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: '#aaaaaa',
                      padding: '4px 8px 6px'
                    }}>
                      {groupLabel}
                    </div>
                    {items.map(({ label, href, icon: Icon }) => {
                      const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                      return (
                        <Link
                          key={href}
                          href={href}
                          className="flyout-link"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: '8px', textDecoration: 'none',
                            fontSize: '13px', fontWeight: isActive ? '600' : '500',
                            width: '100%',
                            background: isActive
                              ? 'linear-gradient(135deg, rgba(108,71,255,0.9), rgba(108,71,255,0.6))'
                              : 'transparent',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                          }}
                        >
                          <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} style={{ color: isActive ? '#fff' : '#00C6AE', flexShrink: 0 }} />
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                )}
                <div
                  className="nav-group-body"
                  data-open={isOpen}
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 0 6px' }}>
                    {items.map(({ label, href, icon: Icon }) => {
                      const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                      return (
                        <Link
                          key={href}
                          href={href}
                          className="nav-link"
                          title={label}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px', borderRadius: '10px', textDecoration: 'none',
                            fontSize: '14px', fontWeight: isActive ? '600' : '500',
                            position: 'relative', overflow: 'hidden',
                            background: isActive
                              ? 'linear-gradient(135deg, rgba(108,71,255,0.9), rgba(108,71,255,0.6))'
                              : 'transparent',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                            boxShadow: isActive ? '0 4px 16px rgba(108,71,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                            border: isActive ? '1px solid rgba(108,71,255,0.5)' : '1px solid transparent',
                          }}
                        >
                          <Icon
                            size={17}
                            strokeWidth={isActive ? 2.5 : 1.8}
                            style={{ color: isActive ? '#fff' : '#00C6AE', flexShrink: 0 }}
                          />
                          {label}
                          {isActive && (
                            <div style={{
                              position: 'absolute', right: '12px', width: '6px', height: '6px',
                              borderRadius: '50%', background: '#fff', opacity: 0.7
                            }} />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            className="logout-btn"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px', background: 'transparent',
              border: '1px solid transparent', color: 'rgba(255,255,255,0.45)',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '4px'
            }}
          >
            {mounted && resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {mounted && resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div style={{
            padding: '14px', marginBottom: '6px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6C47FF, #00C6AE)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: '#fff'
              }}>
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || '...'}
                </div>
              </div>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px', background: 'transparent',
              border: '1px solid transparent', color: 'rgba(255,255,255,0.35)',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '260px', flex: 1, background: 'var(--page-bg)', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}
