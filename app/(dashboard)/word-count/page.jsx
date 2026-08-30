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
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <FileText style={{ color: '#7C3AED' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>Word Count & SEO</h1>
      </div>
      <p className="text-[#999] mb-8">Analyze your content's stats and get AI-powered SEO recommendations.</p>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={10}
            className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Target Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. content marketing"
            className="w-full border border-[#1f1f1f] bg-[#1a1a1a] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
            onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#7C3AED' }}
        >
          {loading ? 'Analyzing...' : '✦ Analyze'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-4 flex flex-col items-center text-center gap-2">
            <Icon style={{ color: '#F59E0B' }} size={20} />
            <div className="text-lg font-bold" style={{ color: '#FAFAFA' }}>{value}</div>
            <div className="text-xs text-[#999]">{label}</div>
          </div>
        ))}
      </div>

      {recommendations && (
        <div className="mt-6 bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6">
          <h2 className="font-bold text-[#7C3AED] mb-4 uppercase tracking-wide text-sm">AI Recommendations</h2>
          <ul className="space-y-3">
            {recommendations
              .split('\n')
              .map((line) => line.replace(/^[-•]\s*/, '').trim())
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#ccc] leading-relaxed">
                  <span
                    className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#F59E0B' }}
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
