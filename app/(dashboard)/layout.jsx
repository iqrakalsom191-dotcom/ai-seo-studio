'use client'
import { useEffect, useState } from 'react'
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
  HelpCircle,
  Share2,
  CalendarDays,
  Sun,
  Moon
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
    ],
  },
  {
    label: 'Generators',
    items: [
      { label: 'Slug Generator', href: '/slug', icon: Link2 },
      { label: 'FAQ Generator', href: '/faq', icon: HelpCircle },
      { label: 'Social Captions', href: '/social', icon: Share2 },
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
        .nav-link:hover { background: rgba(108,71,255,0.12) !important; color: #fff !important; backdrop-filter: blur(10px); }
        .nav-link:hover svg { color: #00C6AE !important; }
        .logout-btn:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
        .nav-link { transition: all 0.18s ease !important; }
        .logout-btn { transition: all 0.18s ease !important; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: '260px', minHeight: '100vh', background: '#0F0F0F',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, zIndex: 100,
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
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navGroups.map(({ label: groupLabel, items }) => (
            <div key={groupLabel} style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                padding: '8px 14px 6px'
              }}>
                {groupLabel}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {items.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="nav-link"
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
          ))}
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
