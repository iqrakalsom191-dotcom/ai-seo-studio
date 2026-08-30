'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link2, Copy, Check } from 'lucide-react'

export default function SlugPage() {
  const [keyword, setKeyword] = useState('')
  const [slugs, setSlugs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const generate = async () => {
    if (!keyword.trim()) return setError('Please enter a keyword first')
    setLoading(true)
    setError('')
    setSlugs([])

    try {
      const res = await fetch('/api/slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const data = await res.json()
      if (res.ok && data.slugs) {
        setSlugs(data.slugs)
      } else {
        setError(data.error || 'Slug generation failed')
        toast.error(data.error || 'Slug generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = async (slug, index) => {
    await navigator.clipboard.writeText(slug)
    setCopiedIndex(index)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Link2 style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold " style={{ color: '#FAFAFA' }}>Slug Generator</h1>
      </div>
      <p className="text-[#999] mb-8">Enter a keyword and get 5 SEO-friendly URL slugs.</p>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. best coffee makers 2026"
            className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        {error && <div className="bg-[#ef4444]/10 text-[#f87171] text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Generating...' : '✦ Generate Slugs'}
        </button>
      </div>

      {slugs.length > 0 && (
        <div className="mt-6 space-y-3">
          {slugs.map((slug, i) => (
            <div
              key={i}
              className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition"
            >
              <code className="text-sm font-medium text-white break-all">/{slug}</code>
              <button
                onClick={() => copy(slug, i)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-[#1f1f1f] hover:bg-[#1a1a1a] transition"
                style={{ color: copiedIndex === i ? '#FFD4C2' : '#FF6B35' }}
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
