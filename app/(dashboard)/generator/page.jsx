'use client'

import { useState } from 'react'
import { Sparkles, Copy, BookmarkPlus, Loader2, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

function parseBold(line) {
  const parts = line.split(/\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold text-[#1A1A2E]">{part}</strong>
      : part
  )
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# '))
      return <h1 key={i} className="text-2xl font-bold text-[#1A1A2E] mt-6 mb-3">{parseBold(line.slice(2))}</h1>
    if (line.startsWith('## '))
      return <h2 key={i} className="text-xl font-bold text-[#1A1A2E] mt-5 mb-2">{parseBold(line.slice(3))}</h2>
    if (line.startsWith('### '))
      return <h3 key={i} className="text-lg font-semibold text-[#6C47FF] mt-4 mb-2">{parseBold(line.slice(4))}</h3>
    if (line.startsWith('#### '))
      return <h4 key={i} className="text-base font-semibold text-[#4A4A6A] mt-3 mb-1">{parseBold(line.slice(5))}</h4>
    if (line.startsWith('- ') || line.startsWith('* '))
      return <li key={i} className="ml-4 text-[#1A1A2E] leading-relaxed list-disc my-0.5">{parseBold(line.slice(2))}</li>
    if (line.match(/^\d+\. /))
      return <li key={i} className="ml-4 text-[#1A1A2E] leading-relaxed list-decimal my-0.5">{parseBold(line.replace(/^\d+\. /, ''))}</li>
    if (line.startsWith('---') || line.startsWith('***'))
      return <hr key={i} className="border-[#6C47FF]/10 my-4" />
    if (line.trim() === '')
      return <div key={i} className="h-2" />
    return <p key={i} className="text-[#1A1A2E] leading-relaxed my-1">{parseBold(line)}</p>
  })
}

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

  async function handleSave() {
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
  }

  const selectClass = 'w-full rounded-lg border border-[#6C47FF]/20 bg-white px-4 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/40 appearance-none cursor-pointer'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Sparkles size={22} className="text-[#6C47FF]" />
          AI Blog Generator
        </h1>
        <p className="mt-1 text-sm text-[#4A4A6A]">
          Enter a keyword and let AI write a full blog post for you.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#6C47FF]/10 shadow-[0_4px_24px_rgba(108,71,255,0.06)] p-6 space-y-5">

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#1A1A2E]">Keyword</label>
          <input
            type="text"
            placeholder="e.g. WordPress SEO plugins"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full rounded-lg border border-[#6C47FF]/20 bg-white px-4 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#4A4A6A]/50 focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1A1A2E]">Tone</label>
            <div className="relative">
              <select value={tone} onChange={e => setTone(e.target.value)} className={selectClass}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6C47FF]">▾</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1A1A2E]">Word Count</label>
            <div className="relative">
              <select value={wordCount} onChange={e => setWordCount(e.target.value)} className={selectClass}>
                <option value="500">500 words</option>
                <option value="1000">1000 words</option>
                <option value="1500">1500 words</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6C47FF]">▾</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1A1A2E]">Language</label>
            <div className="relative">
              <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass}>
                <option value="english">English</option>
                <option value="urdu">Urdu</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6C47FF]">▾</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6C47FF] hover:bg-[#5a38e0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors duration-200"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating…</>
          ) : (
            <><Sparkles size={16} /> Generate Blog Post</>
          )}
        </button>
      </div>

      {loading && !output && (
        <div className="bg-white rounded-2xl border border-[#6C47FF]/10 shadow-[0_4px_24px_rgba(108,71,255,0.06)] p-6">
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#4A4A6A]">
            <Loader2 size={32} className="animate-spin text-[#6C47FF]" />
            <p className="text-sm">AI is writing your blog post…</p>
          </div>
        </div>
      )}

      {output && (
        <div className="bg-white rounded-2xl border-2 border-[#6C47FF]/20 shadow-[0_8px_32px_rgba(108,71,255,0.10)] p-6 space-y-4">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1A1A2E]">Generated Content</h2>
            <span className="bg-[#00C6AE]/10 text-[#00C6AE] text-xs font-semibold px-3 py-1 rounded-full">
              {output.split(/\s+/).length} words
            </span>
          </div>

          <div className="overflow-y-auto max-h-[500px] rounded-xl border border-[#6C47FF]/10 bg-[#F0EEFF]/30 px-5 py-4 text-sm">
            {renderMarkdown(output)}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#6C47FF] hover:bg-[#5a38e0] text-white font-semibold py-2.5 text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : savedOk ? <CheckCheck size={15} /> : <BookmarkPlus size={15} />}
              {saving ? 'Saving…' : savedOk ? 'Saved!' : 'Save to Library'}
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#00C6AE] text-[#00C6AE] hover:bg-[#00C6AE] hover:text-white font-semibold py-2.5 text-sm transition-colors duration-200"
            >
              {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
