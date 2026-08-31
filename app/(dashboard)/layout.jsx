'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
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
  FileText,
  Globe,
  Gauge,
  ChevronDown,
  BrainCircuit,
  Menu,
  X,
  Cpu,
  Rocket,
} from 'lucide-react'
import ReviewWidget from '@/components/ui/ReviewWidget'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'SEO Workflow',
    items: [
      { label: 'Projects', href: '/projects', icon: Rocket },
    ],
  },
  {
    label: 'Content Creation',
    items: [
      { label: 'Blog Generator', href: '/generator', icon: Sparkles },
      { label: 'Title Generator', href: '/title-generator', icon: Type },
      { label: 'Content Improver', href: '/improver', icon: Wand2 },
      { label: 'FAQ Generator', href: '/faq', icon: HelpCircle },
      { label: 'Social Captions', href: '/social', icon: Share2 },
    ],
  },
  {
    label: 'SEO Tools',
    items: [
      { label: 'Keyword Analyzer', href: '/keywords', icon: Search },
      { label: 'Meta Tags', href: '/meta', icon: Tags },
      { label: 'Slug Generator', href: '/slug', icon: Link2 },
      { label: 'Schema Markup', href: '/schema', icon: Braces },
      { label: 'Internal Links', href: '/internal-links', icon: Link2 },
      { label: 'Competitor Meta', href: '/competitor-meta', icon: Globe },
      { label: 'Readability Score', href: '/readability', icon: BookOpenCheck },
      { label: 'Word Count & SEO', href: '/word-count', icon: FileText },
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
      { label: 'WordPress', href: '/settings/wordpress', icon: Globe },
      { label: 'AI Provider', href: '/settings/ai-provider', icon: Cpu },
    ],
  },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
        .nav-link:hover { background: rgba(255, 107, 53,0.15) !important; color: #fff !important; }
        .nav-link:hover svg { color: #FF6B35 !important; }
        .logout-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
        .nav-link { transition: all 150ms ease !important; }
        .logout-btn { transition: all 0.18s ease !important; }
        .nav-group-toggle:hover { background: rgba(255, 107, 53,0.15) !important; color: #fff !important; }
        .nav-group-toggle { transition: all 150ms ease !important; }
        .nav-group-chevron { transition: transform 0.25s ease !important; }
        .nav-group-body { transition: grid-template-rows 0.25s ease !important; display: grid; overflow: hidden; }
        .nav-group-body[data-open="false"] { height: 0; overflow: hidden; visibility: hidden; }
        .flyout-link:hover { background: rgba(255, 107, 53,0.2) !important; color: #fff !important; }
        .flyout-link { transition: all 150ms ease !important; }
      `}</style>

      {/* Mobile Top Navbar */}
      <div
        className="md:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4"
        style={{ height: '56px', background: '#0d0d0d', borderBottom: '1px solid #1f1f1f' }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={{ color: '#fff', background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer' }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={20} color="#FF6B35" />
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>AI SEO Studio</span>
        </div>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
          background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700', color: '#fff'
        }}>
          {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-[90]"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:left-0 top-0 h-screen z-[100] flex flex-col overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'left-0' : '-left-[260px]'}`}
        style={{
          width: '260px', background: '#0d0d0d',
          borderRight: '1px solid #1f1f1f',
        }}>

        {/* Logo */}
        <div className="hidden md:block" style={{ padding: '28px 20px 24px', borderBottom: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={26} color="#FF6B35" />
            <span style={{
              fontSize: '16px', fontWeight: '800', letterSpacing: '-0.4px', color: '#fff'
            }}>AI SEO Studio</span>
          </div>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="md:hidden flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f1f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={22} color="#FF6B35" />
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>AI SEO Studio</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            style={{ color: '#999999', background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
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
                    background: hasActiveChild ? 'rgba(255, 107, 53,0.12)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    borderLeft: hasActiveChild ? '3px solid #FF6B35' : '3px solid transparent',
                    fontSize: '14px', fontWeight: '600', letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#999999',
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
                    background: '#1a1a1a', border: '1px solid #1f1f1f', color: 'white',
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
                      background: '#1a1a1a', border: '1px solid #1f1f1f',
                      borderRadius: '8px', padding: '8px', minWidth: '180px',
                      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '2px'
                    }}
                  >
                    <div style={{
                      fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: '#999999',
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
                            background: isActive ? '#FF6B35' : 'transparent',
                            color: isActive ? '#fff' : '#999999',
                          }}
                        >
                          <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} style={{ color: isActive ? '#fff' : '#FF6B35', flexShrink: 0 }} />
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
                          onClick={() => setSidebarOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px', borderRadius: '10px', textDecoration: 'none',
                            fontSize: '14px', fontWeight: isActive ? '600' : '500',
                            position: 'relative', overflow: 'hidden',
                            background: isActive ? '#FF6B35' : 'transparent',
                            color: isActive ? '#fff' : '#999999',
                            border: '1px solid transparent',
                          }}
                        >
                          <Icon
                            size={17}
                            strokeWidth={isActive ? 2.5 : 1.8}
                            style={{ color: isActive ? '#fff' : '#FF6B35', flexShrink: 0 }}
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
        <div style={{ padding: '12px', borderTop: '1px solid #1f1f1f' }}>
          <div style={{
            padding: '14px', marginBottom: '6px', borderRadius: '12px',
            background: '#111',
            border: '1px solid #1f1f1f',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: '#FF6B35',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: '#fff'
              }}>
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div style={{ fontSize: '11px', color: '#999999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              border: '1px solid transparent', color: '#999999',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#09090B] min-h-screen ml-0 md:ml-[260px] pt-[56px] md:pt-0">
        {children}
      </div>

      <ReviewWidget />
    </div>
  )
}
