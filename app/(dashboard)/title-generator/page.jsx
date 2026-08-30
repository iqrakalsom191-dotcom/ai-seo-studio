'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Type, Copy, Check } from 'lucide-react'

export default function TitleGeneratorPage() {
  const [keyword, setKeyword] = useState('')
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const generate = async () => {
    if (!keyword.trim()) return setError('Please enter a keyword first')
    setLoading(true)
    setError('')
    setTitles([])

    try {
      const res = await fetch('/api/title-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const data = await res.json()
      if (res.ok && data.titles) {
        const parsed = data.titles.split('\n').map((t) => t.trim()).filter(Boolean)
        setTitles(parsed)
      } else {
        setError(data.error || 'Title generation failed')
        toast.error(data.error || 'Title generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = async (title, index) => {
    try {
      await navigator.clipboard.writeText(title)
      setCopiedIndex(index)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (e) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Type style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold text-white">Title Generator</h1>
      </div>
      <p className="text-[#999] mb-8">Enter a keyword and get 10 catchy, SEO-optimized blog title options.</p>

      <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. best coffee makers 2026"
            className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
          />
        </div>

        {error && <div className="text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Generating...' : '✦ Generate Titles'}
        </button>
      </div>

      {titles.length > 0 && (
        <div className="mt-6 grid gap-3">
          {titles.map((title, i) => (
            <div
              key={i}
              className="rounded-2xl border p-4 flex items-center justify-between gap-4 hover:shadow-md transition"
              style={{ background: '#111111', borderColor: '#1f1f1f' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{title}</p>
                <span className={`text-xs font-medium ${title.length > 60 ? 'text-red-500' : 'text-green-500'}`}>
                  {title.length}/60
                </span>
              </div>
              <button
                onClick={() => copy(title, i)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition"
                style={{ borderColor: '#1f1f1f', color: copiedIndex === i ? '#FFD4C2' : '#FF6B35' }}
              >
                {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                {copiedIndex === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
