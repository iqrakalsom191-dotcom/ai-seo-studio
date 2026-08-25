'use client'
import { useState } from 'react'
import { Tag, Copy, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function MetaPage() {
  const [topic, setTopic] = useState('')
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const generate = async () => {
    if (!topic || !keyword) return setError('Please fill all fields')
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)

    try {
      const res = await fetch('/api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keyword }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text) => navigator.clipboard.writeText(text)

  const saveToLibrary = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('saved_content').insert({
        user_id: user.id,
        title: result.title,
        content: result.title + '\n\n' + result.description,
        type: 'meta',
        keyword: keyword,
      })
      setSaved(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <Tag className="text-violet-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Meta Tag Generator</h1>
      </div>
      <p className="text-gray-500 mb-8">Generate SEO-optimized title and meta description for any page.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Page Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Best WordPress SEO Plugins"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. WordPress SEO plugins"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Generating...' : '✦ Generate Meta Tags'}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">SEO Title</span>
              <span className={`text-xs font-medium ${result.title.length > 60 ? 'text-red-500' : 'text-green-500'}`}>
                {result.title.length}/60
              </span>
            </div>
            <p className="text-gray-800 text-sm mb-3">{result.title}</p>
            <button onClick={() => copy(result.title)} className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-800">
              <Copy size={14} /> Copy Title
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Meta Description</span>
              <span className={`text-xs font-medium ${result.description.length > 155 ? 'text-red-500' : 'text-green-500'}`}>
                {result.description.length}/155
              </span>
            </div>
            <p className="text-gray-800 text-sm mb-3">{result.description}</p>
            <button onClick={() => copy(result.description)} className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-800">
              <Copy size={14} /> Copy Description
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-semibold text-gray-500 mb-3">GOOGLE PREVIEW</p>
            <p className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">{result.title}</p>
            <p className="text-green-700 text-xs">yourwebsite.com</p>
            <p className="text-gray-600 text-xs mt-1">{result.description}</p>
          </div>

          <button
            onClick={saveToLibrary}
            disabled={saving || saved}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            style={{ backgroundColor: '#6C47FF' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : saved ? 'Saved to Library ✓' : 'Save to Library'}
          </button>
        </div>
      )}
    </div>
  )
}
