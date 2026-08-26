'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Globe, Type, AlignLeft, Sparkles } from 'lucide-react'

export default function CompetitorMetaPage() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL first')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/competitor-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        toast.error(data.error || 'Analysis failed')
      }
    } catch (e) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <Globe style={{ color: '#6C47FF' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Competitor Meta</h1>
      </div>
      <p className="text-gray-500 mb-8">Analyze a competitor's title tag and meta description, and get AI-powered improvement suggestions.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/some-page"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
            onFocus={(e) => (e.target.style.borderColor = '#6C47FF')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#6C47FF' }}
        >
          {loading ? 'Analyzing...' : '✦ Analyze'}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Type size={15} style={{ color: '#00C6AE' }} />
                Current Title
              </div>
              <span className="text-xs text-gray-400">{result.title?.length || 0} chars</span>
            </div>
            <p className="text-sm text-gray-700">{result.title || '(no title found)'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <AlignLeft size={15} style={{ color: '#00C6AE' }} />
                Current Meta Description
              </div>
              <span className="text-xs text-gray-400">{result.description?.length || 0} chars</span>
            </div>
            <p className="text-sm text-gray-700">{result.description || '(no meta description found)'}</p>
          </div>

          {result.analysis && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                <Sparkles size={15} style={{ color: '#6C47FF' }} />
                AI Analysis & Suggestions
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{result.analysis}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
