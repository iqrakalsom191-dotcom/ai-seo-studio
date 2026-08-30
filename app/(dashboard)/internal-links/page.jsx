'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link2, ArrowRight } from 'lucide-react'

export default function InternalLinksPage() {
  const [content, setContent] = useState('')
  const [urls, setUrls] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const suggest = async () => {
    if (!content.trim()) {
      toast.error('Please paste your content first')
      return
    }
    if (!urls.trim()) {
      toast.error('Please paste a list of URLs first')
      return
    }

    setLoading(true)
    setSuggestions([])
    try {
      const res = await fetch('/api/internal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, urls }),
      })
      const data = await res.json()
      if (res.ok && data.suggestions) {
        setSuggestions(data.suggestions)
      } else {
        toast.error(data.error || 'Suggestion generation failed')
      }
    } catch (e) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Link2 style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>Internal Links</h1>
      </div>
      <p className="text-[#999] mb-8">Find the most relevant internal links for your content, with suggested anchor text.</p>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your main content here..."
            rows={8}
            className="w-full border bg-[#1a1a1a] text-white placeholder-gray-600 border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Existing URLs (one per line)</label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={'https://example.com/blog/seo-basics\nhttps://example.com/blog/keyword-research\nhttps://example.com/services/content-writing'}
            rows={6}
            className="w-full border bg-[#1a1a1a] text-white placeholder-gray-600 border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        <button
          onClick={suggest}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Analyzing...' : '✦ Suggest Internal Links'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold break-all" style={{ color: '#FF6B35' }}>
                <Link2 size={14} className="flex-shrink-0" />
                {s.url}
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-[#999]">
                <ArrowRight size={14} style={{ color: '#FFD4C2' }} className="flex-shrink-0" />
                <span className="font-bold text-[#FF6B35]">Anchor text:</span> "{s.anchor}"
              </div>
              <p className="mt-2 text-sm text-[#999]">{s.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
