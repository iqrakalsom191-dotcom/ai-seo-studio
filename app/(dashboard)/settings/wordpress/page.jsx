'use client'

import { useEffect, useState } from 'react'
import { Globe, Save, Plug, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'

export default function WordPressSettingsPage() {
  const [siteUrl, setSiteUrl] = useState('')
  const [username, setUsername] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState(false)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('wordpress_credentials')
          .select('site_url, username, app_password')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          setSiteUrl(data.site_url || '')
          setUsername(data.username || '')
          setAppPassword(data.app_password || '')
          setConnected(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = guardedAction(async () => {
    if (!siteUrl || !username || !appPassword) {
      toast.error('Please fill all fields')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('wordpress_credentials')
        .upsert(
          {
            user_id: user.id,
            site_url: siteUrl.trim().replace(/\/$/, ''),
            username: username.trim(),
            app_password: appPassword.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (error) throw error
      setConnected(true)
      toast.success('WordPress credentials saved')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to save credentials')
    } finally {
      setSaving(false)
    }
  })

  const testConnection = guardedAction(async () => {
    if (!siteUrl || !username || !appPassword) {
      toast.error('Please fill all fields before testing')
      return
    }
    setTesting(true)
    try {
      const cleanUrl = siteUrl.trim().replace(/\/$/, '')
      const token = btoa(`${username.trim()}:${appPassword.trim()}`)

      const res = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Connection failed. Check your site URL, username, and application password.')
      }

      const data = await res.json()
      toast.success(`Connected as ${data.name || username}`)
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Connection test failed')
    } finally {
      setTesting(false)
    }
  })

  return (
    <div className="max-w-2xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Globe size={28} style={{ color: '#7C3AED' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>WordPress Connection</h1>
      </div>
      <p className="text-[#999] mb-8">Connect your WordPress site to publish content directly from AI SEO Studio.</p>

      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 space-y-4">
        {connected && (
          <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <CheckCircle2 size={16} />
            Credentials on file
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Site URL</label>
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://yoursite.com"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. admin"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Application Password</label>
          <input
            type="password"
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] disabled:opacity-50"
          />
          <p className="text-xs text-[#999] mt-1">
            Generate one from your WordPress admin under Users → Profile → Application Passwords.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={testConnection}
            disabled={testing || loading}
            className="flex-1 flex items-center justify-center gap-2 border border-[#1f1f1f] text-[#999] font-semibold py-3 rounded-xl transition hover:bg-[#1a1a1a] disabled:opacity-50"
          >
            <Plug size={16} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={save}
            disabled={saving || loading}
            className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#7C3AED' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <GuestModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
