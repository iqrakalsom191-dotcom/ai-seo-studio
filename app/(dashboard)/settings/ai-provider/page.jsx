'use client'

import { useEffect, useState } from 'react'
import { Cpu, Save, Plug, Eye, EyeOff, CheckCircle2, ExternalLink, Trash2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'

const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with open-weight models',
    models: ['qwen/qwen3.6-27b', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    keyUrl: 'https://console.groq.com',
    keySteps: ['Get free API key at console.groq.com', 'Login', 'API Keys', 'Create New Key'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o and GPT-3.5 family models',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    keyUrl: 'https://platform.openai.com',
    keySteps: ['Get API key at platform.openai.com', 'Login', 'API Keys', 'Create New Secret Key'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: "Google's multimodal Gemini models",
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    keyUrl: 'https://aistudio.google.com',
    keySteps: ['Get free API key at aistudio.google.com', 'Login', 'Get API Key', 'Create API Key'],
  },
  {
    id: 'claude',
    name: 'Claude',
    description: "Anthropic's Claude model family",
    models: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    keyUrl: 'https://console.anthropic.com',
    keySteps: ['Get API key at console.anthropic.com', 'Login', 'API Keys', 'Create Key'],
  },
]

function providerMeta(id) {
  return PROVIDERS.find((p) => p.id === id)
}

export default function AIProviderSettingsPage() {
  const [connectedProviders, setConnectedProviders] = useState([])
  const [provider, setProvider] = useState('groq')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(PROVIDERS[0].models[0])
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settingActive, setSettingActive] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [updatingModel, setUpdatingModel] = useState(null)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  const loadProviders = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_ai_settings')
        .select('provider, api_key, model, is_active')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setConnectedProviders(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [])

  const selectProvider = (id) => {
    setProvider(id)
    const p = providerMeta(id)
    setModel(p.models[0])
  }

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
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
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
    if (!apiKey.trim() || !model) {
      toast.error('Please fill all fields')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const isFirstProvider = connectedProviders.length === 0

      const { error } = await supabase
        .from('user_ai_settings')
        .upsert(
          {
            user_id: user.id,
            provider,
            api_key: apiKey.trim(),
            model,
            is_active: isFirstProvider,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,provider' }
        )

      if (error) throw error
      setApiKey('')
      await loadProviders()
      toast.success('AI provider saved')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to save provider')
    } finally {
      setSaving(false)
    }
  })

  const setAsActive = guardedAction(async (providerId) => {
    setSettingActive(providerId)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: deactivateError } = await supabase
        .from('user_ai_settings')
        .update({ is_active: false })
        .eq('user_id', user.id)

      if (deactivateError) throw deactivateError

      const { error: activateError } = await supabase
        .from('user_ai_settings')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('provider', providerId)

      if (activateError) throw activateError

      await loadProviders()
      toast.success(`${providerMeta(providerId)?.name} is now active`)
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to set active provider')
    } finally {
      setSettingActive(null)
    }
  })

  const updateProviderModel = guardedAction(async (providerId, newModel) => {
    setUpdatingModel(providerId)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_ai_settings')
        .update({ model: newModel, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('provider', providerId)

      if (error) throw error

      setConnectedProviders((prev) =>
        prev.map((p) => (p.provider === providerId ? { ...p, model: newModel } : p))
      )
      toast.success('Model updated')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to update model')
    } finally {
      setUpdatingModel(null)
    }
  })

  const removeProvider = guardedAction(async (providerId) => {
    setRemoving(providerId)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const removedWasActive = connectedProviders.find((p) => p.provider === providerId)?.is_active

      const { error } = await supabase
        .from('user_ai_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', providerId)

      if (error) throw error

      if (removedWasActive) {
        const remaining = connectedProviders.filter((p) => p.provider !== providerId)
        if (remaining.length > 0) {
          await supabase
            .from('user_ai_settings')
            .update({ is_active: true })
            .eq('user_id', user.id)
            .eq('provider', remaining[0].provider)
        }
      }

      await loadProviders()
      toast.success('Provider removed')
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to remove provider')
    } finally {
      setRemoving(null)
    }
  })

  const activeProvider = providerMeta(provider)

  return (
    <div className="max-w-2xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Cpu size={28} style={{ color: '#FF6B35' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>AI Provider</h1>
      </div>
      <p className="text-[#999] mb-8">Connect your own AI provider API keys to power content generation.</p>

      {connectedProviders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#999] mb-3 uppercase tracking-wide">Connected Providers</h2>
          <div className="space-y-3">
            {connectedProviders.map((cp) => {
              const meta = providerMeta(cp.provider)
              return (
                <div
                  key={cp.provider}
                  className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-4 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: '#FAFAFA' }}>
                        {meta?.name || cp.provider}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                      >
                        <CheckCircle2 size={11} />
                        Connected
                      </span>
                      {cp.is_active && (
                        <span
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,107,53,0.15)', color: '#FF6B35' }}
                        >
                          <Zap size={11} />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="relative inline-block">
                      <select
                        value={cp.model}
                        onChange={(e) => updateProviderModel(cp.provider, e.target.value)}
                        disabled={updatingModel === cp.provider}
                        className="appearance-none text-xs text-white rounded-lg pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF6B35] disabled:opacity-50 cursor-pointer"
                        style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                      >
                        {(meta?.models || [cp.model]).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#FF6B35] text-[10px]">▾</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAsActive(cp.provider)}
                      disabled={cp.is_active || settingActive === cp.provider}
                      className="text-xs font-semibold px-3 py-2 rounded-lg transition disabled:cursor-default"
                      style={
                        cp.is_active
                          ? { background: '#1a1a1a', color: '#666', border: '1px solid #1f1f1f' }
                          : { background: '#FF6B35', color: '#fff' }
                      }
                    >
                      {cp.is_active ? 'Active' : settingActive === cp.provider ? 'Setting…' : 'Set Active'}
                    </button>
                    <button
                      onClick={() => removeProvider(cp.provider)}
                      disabled={removing === cp.provider}
                      className="p-2 rounded-lg border border-[#1f1f1f] text-[#999] hover:text-[#f87171] hover:border-[#f87171]/40 transition disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-[#999] mb-3 uppercase tracking-wide">Add Provider</h2>
      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#999] mb-3">Provider</label>
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map((p) => {
              const isSelected = provider === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProvider(p.id)}
                  disabled={loading}
                  className="text-left rounded-xl p-4 transition disabled:opacity-50"
                  style={{
                    background: '#1a1a1a',
                    border: `1.5px solid ${isSelected ? '#FF6B35' : '#1f1f1f'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm" style={{ color: isSelected ? '#FF6B35' : '#FAFAFA' }}>
                      {p.name}
                    </span>
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{
                        border: `1.5px solid ${isSelected ? '#FF6B35' : '#333'}`,
                        background: isSelected ? '#FF6B35' : 'transparent',
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#999] leading-relaxed">{p.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
              How to get your {activeProvider.name} API key
            </span>
            <a
              href={activeProvider.keyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#FF6B35' }}
            >
              <ExternalLink size={13} />
              Open {activeProvider.name}
            </a>
          </div>
          <ol className="space-y-2">
            {activeProvider.keySteps.map((step, i) => (
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
          <label className="block text-sm font-medium text-[#999] mb-1">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${activeProvider.name} API key`}
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

        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Model</label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white border border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50 appearance-none cursor-pointer"
            >
              {activeProvider.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#FF6B35]">▾</span>
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
            {saving ? 'Saving...' : 'Save Provider'}
          </button>
        </div>
      </div>

      <GuestModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
