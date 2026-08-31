'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Share2, Copy, Check, Camera, AtSign, Briefcase } from 'lucide-react'
import { renderMarkdown } from '@/components/ui/MarkdownOutput'

const PLATFORMS = [
  { label: 'Instagram', icon: Camera },
  { label: 'Twitter/X', icon: AtSign },
  { label: 'LinkedIn', icon: Briefcase },
]

export default function SocialPage() {
  const [content, setContent] = useState('')
  const [selected, setSelected] = useState(['Instagram'])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedPlatform, setCopiedPlatform] = useState(null)

  const togglePlatform = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    )
  }

  const generate = async () => {
    if (!content.trim()) return setError('Please paste your blog content first')
    if (selected.length === 0) return setError('Select at least one platform')
    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms: selected }),
      })
      const data = await res.json()
      if (res.ok && data.results) {
        setResults(data.results)
      } else {
        setError(data.error || 'Caption generation failed')
        toast.error(data.error || 'Caption generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = async (text, platform) => {
    await navigator.clipboard.writeText(text)
    setCopiedPlatform(platform)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Share2 style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold text-white">Social Captions</h1>
      </div>
      <p className="text-[#999] mb-8">Paste your blog content, pick platforms, and generate ready-to-post captions.</p>

      <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Blog Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your blog content here..."
            rows={8}
            className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none resize-y text-white placeholder-gray-600"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-2">Platforms</label>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map(({ label, icon: Icon }) => {
              const isChecked = selected.includes(label)
              return (
                <label
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-medium transition"
                  style={{
                    borderColor: isChecked ? '#FF6B35' : '#1f1f1f',
                    backgroundColor: isChecked ? 'rgba(255, 107, 53, 0.15)' : '#111111',
                    color: isChecked ? '#FF6B35' : '#999999',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePlatform(label)}
                    className="hidden"
                  />
                  <Icon size={16} />
                  {label}
                </label>
              )
            })}
          </div>
        </div>

        {error && <div className="text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Generating...' : '✦ Generate Captions'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((r, i) => (
            <div key={i} className="rounded-2xl border p-6" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold" style={{ color: '#FFD4C2' }}>{r.platform}</span>
                <button
                  onClick={() => copy(r.caption, r.platform)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition"
                  style={{ borderColor: '#1f1f1f', color: copiedPlatform === r.platform ? '#FFD4C2' : '#FF6B35' }}
                >
                  {copiedPlatform === r.platform ? <Check size={14} /> : <Copy size={14} />}
                  {copiedPlatform === r.platform ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-sm whitespace-pre-wrap">{renderMarkdown(r.caption)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
