'use client'

import { useState } from 'react'
import { Sparkles, Copy, BookmarkPlus, Loader2, CheckCheck, Globe, FileEdit, Send, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'
import { MarkdownContent, OutputTopBar } from '@/components/ui/MarkdownOutput'

export default function GeneratorPage() {
  const [keyword, setKeyword]     = useState('')
  const [tone, setTone]           = useState('professional')
  const [wordCount, setWordCount] = useState('1000')
  const [language, setLanguage]   = useState('english')
  const [output, setOutput]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [copied, setCopied]       = useState(false)
  const [saving, setSaving]       = useState(false)
  const [savedOk, setSavedOk]     = useState(false)
  const [error, setError]         = useState('')
  const [showPublishPanel, setShowPublishPanel] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  async function handleGenerate() {
    if (!keyword.trim()) { setError('Please enter a keyword.'); return }
    setError('')
    setOutput('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tone, wordCount, language }),
      })
      const data = await res.json()
      if (data.content) {
        setOutput(data.content)
      } else {
        setError('No content received. Please try again.')
        toast.error('No content received. Please try again.')
      }
    } catch (e) {
      setError('Generation failed. Please try again.')
      toast.error('Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = guardedAction(async function handleSave() {
    if (!output) return
    setSaving(true)
    setSavedOk(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: dbErr } = await supabase.from('saved_content').insert({
      user_id:    user.id,
      title:      keyword,
      content:    output,
      type:       'blog',
      keyword:    keyword,
      word_count: output.split(/\s+/).length,
    })
    setSaving(false)
    if (!dbErr) { setSavedOk(true); toast.success('Saved to library'); setTimeout(() => setSavedOk(false), 2500) }
    else { setError('Save failed. Please try again.'); toast.error('Save failed. Please try again.') }
  })

  const handlePublish = guardedAction(async function handlePublish(status) {
    if (!output) return
    setPublishing(true)
    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: keyword, content: output, status }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Publish failed')
      }
      setShowPublishPanel(false)
      toast.success(
        (t) => (
          <div className="text-sm">
            <p className="font-semibold mb-1">
              {status === 'publish' ? 'Published to WordPress!' : 'Saved as draft in WordPress!'}
            </p>
            <div className="flex gap-3">
              {data.postUrl && (
                <a href={data.postUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] underline">
                  View Post
                </a>
              )}
              {data.editUrl && (
                <a href={data.editUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] underline">
                  Edit in WP Admin
                </a>
              )}
            </div>
          </div>
        ),
        { duration: 8000 }
      )
    } catch (e) {
      toast.error(e.message || 'Failed to publish to WordPress')
    } finally {
      setPublishing(false)
    }
  })

  const selectClass = 'w-full rounded-lg border border-[#1f1f1f] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 appearance-none cursor-pointer'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" style={{ background: '#09090B' }}>

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
          <Sparkles size={22} className="text-[#FF6B35]" />
          AI Blog Generator
        </h1>
        <p className="mt-1 text-sm text-[#999]">
          Enter a keyword and let AI write a full blog post for you.
        </p>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-[0_4px_24px_rgba(255, 107, 53,0.06)] p-6 space-y-5">

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white">Keyword</label>
          <input
            type="text"
            placeholder="e.g. WordPress SEO plugins"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-[#1f1f1f] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Tone</label>
            <div className="relative">
              <select value={tone} onChange={e => setTone(e.target.value)} className={selectClass}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#FF6B35]">▾</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Word Count</label>
            <div className="relative">
              <select value={wordCount} onChange={e => setWordCount(e.target.value)} className={selectClass}>
                <option value="500">500 words</option>
                <option value="1000">1000 words</option>
                <option value="1500">1500 words</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#FF6B35]">▾</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white">Language</label>
            <div className="relative">
              <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass}>
                <option value="english">English</option>
                <option value="urdu">Urdu</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#FF6B35]">▾</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#f87171] bg-[#ef4444]/10 rounded-lg px-4 py-2">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors duration-200"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating…</>
          ) : (
            <><Sparkles size={16} /> Generate Blog Post</>
          )}
        </button>
      </div>

      {loading && !output && (
        <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-[0_4px_24px_rgba(255, 107, 53,0.06)] p-6">
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#999]">
            <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
            <p className="text-sm">AI is writing your blog post…</p>
          </div>
        </div>
      )}

      {output && (
        <div className="bg-[#111] rounded-2xl border-2 border-[#FF6B35]/20 shadow-[0_8px_32px_rgba(255, 107, 53,0.10)] p-6 space-y-4">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Generated Content</h2>
          </div>

          <OutputTopBar wordCount={output.split(/\s+/).length} contentType="Blog Post" />
          <MarkdownContent text={output} />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35] text-white font-semibold py-2.5 text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : savedOk ? <CheckCheck size={15} /> : <BookmarkPlus size={15} />}
              {saving ? 'Saving…' : savedOk ? 'Saved!' : 'Save to Library'}
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#FFD4C2] text-[#FFD4C2] hover:bg-[#FFD4C2] hover:text-white font-semibold py-2.5 text-sm transition-colors duration-200"
            >
              {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>

            <button
              onClick={() => setShowPublishPanel(true)}
              disabled={publishing}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-semibold py-2.5 text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {publishing ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
              {publishing ? 'Publishing…' : 'Publish to WordPress'}
            </button>
          </div>

          {showPublishPanel && (
            <div className="rounded-xl border border-[#FF6B35]/20 bg-[#1a1a1a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Publish to WordPress</p>
                <button onClick={() => setShowPublishPanel(false)} className="text-[#999] hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handlePublish('draft')}
                  disabled={publishing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white font-semibold py-2.5 text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {publishing ? <Loader2 size={15} className="animate-spin" /> : <FileEdit size={15} />}
                  Save as Draft
                </button>
                <button
                  onClick={() => handlePublish('publish')}
                  disabled={publishing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35] text-white font-semibold py-2.5 text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  Publish Live
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <GuestModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
