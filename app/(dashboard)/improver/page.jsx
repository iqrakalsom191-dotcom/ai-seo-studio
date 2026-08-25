'use client'
import { useState } from 'react'
import { Wand2, Copy, Save, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const IMPROVEMENT_TYPES = ['Improve Writing', 'SEO Optimize', 'Rewrite', 'Make Shorter', 'Make Longer']

export default function ImproverPage() {
  const [content, setContent] = useState('')
  const [type, setType] = useState(IMPROVEMENT_TYPES[0])
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const improve = async () => {
    if (!content.trim()) return setError('Please paste some content first')
    setLoading(true)
    setError('')
    setResult('')
    setSaved(false)

    try {
      const res = await fetch('/api/improver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      })
      const data = await res.json()
      if (res.ok && data.result) {
        setResult(data.result)
      } else {
        setError(data.error || 'Improvement failed')
        toast.error(data.error || 'Improvement failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const saveToLibrary = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('saved_content').insert({
        user_id: user.id,
        title: `${type} - ${new Date().toLocaleDateString()}`,
        content: result,
        type: 'blog',
      })
      setSaved(true)
      toast.success('Saved to library')
    } catch (e) {
      console.error(e)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <Wand2 style={{ color: '#6C47FF' }} size={28} />
        <h1 className="text-2xl font-bold text-gray-900">AI Content Improver</h1>
      </div>
      <p className="text-gray-500 mb-8">Paste your content, pick an improvement type, and let AI polish it up.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-y"
            style={{ '--tw-ring-color': '#6C47FF' }}
            onFocus={(e) => (e.target.style.borderColor = '#6C47FF')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Improvement Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF] bg-white"
          >
            {IMPROVEMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          onClick={improve}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#6C47FF' }}
        >
          {loading ? 'Improving...' : '✦ Improve Content'}
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold" style={{ color: '#00C6AE' }}>Improved Content</span>
              <span className="text-xs font-medium text-gray-400">{result.length} chars</span>
            </div>
            <textarea
              readOnly
              value={result}
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 leading-relaxed resize-y focus:outline-none bg-gray-50"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={copy}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition border border-gray-200 hover:bg-gray-50"
              style={{ color: '#6C47FF' }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={saveToLibrary}
              disabled={saving || saved}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#6C47FF' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : saved ? 'Saved to Library ✓' : 'Save to Library'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
