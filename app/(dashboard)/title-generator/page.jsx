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
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <Type style={{ color: '#6C47FF' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Title Generator</h1>
      </div>
      <p className="text-gray-500 mb-8">Enter a keyword and get 10 catchy, SEO-optimized blog title options.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. best coffee makers 2026"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
            onFocus={(e) => (e.target.style.borderColor = '#6C47FF')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#6C47FF' }}
        >
          {loading ? 'Generating...' : '✦ Generate Titles'}
        </button>
      </div>

      {titles.length > 0 && (
        <div className="mt-6 grid gap-3">
          {titles.map((title, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition"
            >
              <p className="text-sm font-medium text-gray-800">{title}</p>
              <button
                onClick={() => copy(title, i)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition"
                style={{ color: copiedIndex === i ? '#00C6AE' : '#6C47FF' }}
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
