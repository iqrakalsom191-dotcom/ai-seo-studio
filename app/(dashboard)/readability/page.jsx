'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { BookOpenCheck, Type, AlignLeft, Lightbulb } from 'lucide-react'

function badgeColor(score) {
  if (score >= 70) return '#FFD4C2'
  if (score >= 50) return '#FF6B35'
  return '#FF4757'
}

export default function ReadabilityPage() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!content.trim()) return setError('Please paste some content first')
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/readability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Analysis failed')
        toast.error(data.error || 'Analysis failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <BookOpenCheck style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>Readability Checker</h1>
      </div>
      <p className="text-[#999] mb-8">Paste your content and get a Flesch Reading Ease score with AI-powered suggestions.</p>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Your Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={10}
            className="w-full border bg-[#1a1a1a] text-white placeholder-gray-600 border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-y"
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        {error && <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Analyzing...' : '✦ Check Readability'}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-5 text-center">
              <div className="text-xs font-semibold text-[#999] uppercase mb-2">Flesch Score</div>
              <div className="text-3xl font-extrabold" style={{ color: badgeColor(result.score) }}>
                {result.score}
              </div>
            </div>
            <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-5 text-center flex flex-col items-center justify-center">
              <Type size={18} style={{ color: '#FFD4C2' }} className="mb-1" />
              <div className="text-xs font-semibold text-[#999] uppercase mb-1">Words</div>
              <div className="text-xl font-bold text-white">{result.wordCount}</div>
            </div>
            <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-5 text-center flex flex-col items-center justify-center">
              <AlignLeft size={18} style={{ color: '#FFD4C2' }} className="mb-1" />
              <div className="text-xs font-semibold text-[#999] uppercase mb-1">Sentences</div>
              <div className="text-xl font-bold text-white">{result.sentenceCount}</div>
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6">
            <div className="text-xs font-semibold text-[#999] uppercase mb-2">Reading Level</div>
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: badgeColor(result.score) }}
            >
              {result.readingLevel}
            </span>
          </div>

          {result.suggestions?.length > 0 && (
            <div className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} style={{ color: '#FF6B35' }} />
                <span className="text-sm font-bold text-[#FF6B35]">Improvement Suggestions</span>
              </div>
              <ul className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#e5e5e5', lineHeight: 1.8 }}>
                    <span
                      className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#FF6B35' }}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
