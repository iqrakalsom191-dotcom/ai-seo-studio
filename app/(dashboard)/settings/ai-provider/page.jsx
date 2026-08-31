'use client'

import { useEffect, useState } from 'react'
import { Cpu, Save, Plug, Eye, EyeOff, CheckCircle2, ExternalLink, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'

export default function AIProviderSettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [connected, setConnected] = useState(false)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  const load = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_ai_settings')
        .select('api_key')
        .eq('user_id', user.id)
        .single()

      if (!error && data?.api_key) {
        setApiKey(data.api_key)
        setConnected(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const testConnection = guardedAction(async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key before testing')
      return
    }
    setTesting(true)
    try {
      const res = await fetch('/api/ai-provider/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection test failed')
      }
      toast.success('Connection successful')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Connection test failed')
    } finally {
      setTesting(false)
    }
  })

  const save = guardedAction(async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_ai_settings')
        .upsert(
          {
            user_id: user.id,
            provider: 'groq',
            api_key: apiKey.trim(),
            model: 'qwen/qwen3.6-27b',
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (error) throw error
      setConnected(true)
      toast.success('Groq API key saved')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to save API key')
    } finally {
      setSaving(false)
    }
  })

  const remove = guardedAction(async () => {
    setRemoving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_ai_settings')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setApiKey('')
      setConnected(false)
      toast.success('API key removed. Using the default provider now.')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to remove API key')
    } finally {
      setRemoving(false)
    }
  })

  return (
    <div className="max-w-2xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Cpu size={28} style={{ color: '#FF6B35' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>AI Provider</h1>
      </div>
      <p className="text-[#999] mb-8">
        By default, content is generated using our built-in AI. Add your own Groq API key to use your own account instead.
      </p>

      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 space-y-6">
        {connected && (
          <div className="flex items-center justify-between gap-2 text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Using your own Groq API key
            </span>
            <button
              onClick={remove}
              disabled={removing}
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 disabled:opacity-50"
              style={{ color: '#f87171' }}
            >
              <Trash2 size={13} />
              {removing ? 'Removing…' : 'Remove'}
            </button>
          </div>
        )}

        <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
              How to get your Groq API key
            </span>
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#FF6B35' }}
            >
              <ExternalLink size={13} />
              Open Groq
            </a>
          </div>
          <ol className="space-y-2">
            {['Get free API key at console.groq.com', 'Login', 'API Keys', 'Create New Key'].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#e5e5e5' }}>
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(255,107,53,0.15)', color: '#FF6B35' }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Groq API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
            style={{ backgroundColor: '#FF6B35' }}
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
