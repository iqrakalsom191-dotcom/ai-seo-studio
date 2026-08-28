'use client'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FileText, Type, AlignLeft, Rows3, Percent } from 'lucide-react'

function computeStats(content, keyword) {
  const trimmed = content.trim()
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : []
  const wordCount = words.length
  const charCount = content.length
  const sentenceCount = trimmed
    ? (trimmed.match(/[^.!?]+[.!?]+|\S+$/g) || []).filter((s) => s.trim()).length
    : 0
  const paragraphCount = trimmed
    ? trimmed.split(/\n+/).map((p) => p.trim()).filter(Boolean).length
    : 0

  let keywordDensity = 0
  const kw = keyword.trim().toLowerCase()
  if (kw && wordCount > 0) {
    const kwWordCount = kw.split(/\s+/).length
    const lowerContent = trimmed.toLowerCase()
    const matches = lowerContent.split(kw).length - 1
    keywordDensity = ((matches * kwWordCount) / wordCount) * 100
  }

  return { wordCount, charCount, sentenceCount, paragraphCount, keywordDensity }
}

export default function WordCountPage() {
  const [content, setContent] = useState('')
  const [keyword, setKeyword] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [loading, setLoading] = useState(false)

  const stats = useMemo(() => computeStats(content, keyword), [content, keyword])

  const analyze = async () => {
    if (!content.trim()) {
      toast.error('Please paste some content first')
      return
    }

    setLoading(true)
    setRecommendations('')
    try {
      const res = await fetch('/api/word-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, keyword }),
      })
      const data = await res.json()
      if (res.ok && data.recommendations) {
        setRecommendations(data.recommendations)
      } else {
        toast.error(data.error || 'Analysis failed')
      }
    } catch (e) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { label: 'Words', value: stats.wordCount, icon: Type },
    { label: 'Characters', value: stats.charCount, icon: FileText },
    { label: 'Sentences', value: stats.sentenceCount, icon: AlignLeft },
    { label: 'Paragraphs', value: stats.paragraphCount, icon: Rows3 },
    { label: 'Keyword Density', value: `${stats.keywordDensity.toFixed(2)}%`, icon: Percent },
  ]

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <FileText style={{ color: '#6C47FF' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Word Count & SEO</h1>
      </div>
      <p className="text-gray-500 mb-8">Analyze your content's stats and get AI-powered SEO recommendations.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            onFocus={(e) => (e.target.style.borderColor = '#6C47FF')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. content marketing"
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center gap-2">
            <Icon style={{ color: '#00C6AE' }} size={20} />
            <div className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {recommendations && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#6C47FF] mb-4 uppercase tracking-wide text-sm">AI Recommendations</h2>
          <ul className="space-y-3">
            {recommendations
              .split('\n')
              .map((line) => line.replace(/^[-•]\s*/, '').trim())
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                  <span
                    className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#00C6AE' }}
                  />
                  {line}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
