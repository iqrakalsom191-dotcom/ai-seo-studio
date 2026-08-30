'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Braces, Copy, Check } from 'lucide-react'

const SCHEMA_TYPES = ['Article', 'FAQ', 'Product']

function highlightJson(json) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
    (match) => {
      let color = '#FFD4C2' // number
      if (/^"/.test(match)) {
        color = /:$/.test(match) ? '#FF6B35' : '#E3A008' // key vs string
      } else if (/true|false/.test(match)) {
        color = '#FF6B6B'
      } else if (/null/.test(match)) {
        color = '#9CA3AF'
      }
      return `<span style="color:${color}">${match}</span>`
    }
  )
}

export default function SchemaPage() {
  const [type, setType] = useState('Article')
  const [fields, setFields] = useState({
    title: '', description: '', author: '', date: '',
    qa: '',
    name: '', price: '', brand: '',
  })
  const [schema, setSchema] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const updateField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }))

  const generate = async () => {
    setError('')
    setSchema('')

    let payloadFields = {}
    if (type === 'Article') {
      if (!fields.title.trim()) return setError('Please enter a title first')
      payloadFields = { title: fields.title, description: fields.description, author: fields.author, date: fields.date }
    } else if (type === 'FAQ') {
      if (!fields.qa.trim()) return setError('Please enter Q&A pairs first')
      payloadFields = { qa: fields.qa }
    } else if (type === 'Product') {
      if (!fields.name.trim()) return setError('Please enter a product name first')
      payloadFields = { name: fields.name, price: fields.price, description: fields.description, brand: fields.brand }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, fields: payloadFields }),
      })
      const data = await res.json()
      if (res.ok && data.schema) {
        setSchema(data.schema)
      } else {
        setError(data.error || 'Schema generation failed')
        toast.error(data.error || 'Schema generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(schema)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Braces style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold text-white">Schema Markup</h1>
      </div>
      <p className="text-[#999] mb-8">Generate valid JSON-LD schema markup for your content.</p>

      <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Schema Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white"
            style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
          >
            {SCHEMA_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {type === 'Article' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Title</label>
              <input
                type="text"
                value={fields.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. The Ultimate Guide to SEO"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Description</label>
              <input
                type="text"
                value={fields.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Short summary of the article"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Author</label>
              <input
                type="text"
                value={fields.author}
                onChange={(e) => updateField('author', e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Date Published</label>
              <input
                type="date"
                value={fields.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
          </div>
        )}

        {type === 'FAQ' && (
          <div>
            <label className="block text-sm font-medium text-[#999] mb-1">Q&A Pairs</label>
            <textarea
              value={fields.qa}
              onChange={(e) => updateField('qa', e.target.value)}
              placeholder={'Q: What is SEO?\nA: SEO stands for Search Engine Optimization...\n\nQ: Why does SEO matter?\nA: It helps your site rank higher...'}
              rows={8}
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none resize-none text-white placeholder-gray-600"
              style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
              onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
            />
          </div>
        )}

        {type === 'Product' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Name</label>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Price</label>
              <input
                type="text"
                value={fields.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="e.g. 199.99"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Description</label>
              <input
                type="text"
                value={fields.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Short product description"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Brand</label>
              <input
                type="text"
                value={fields.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="e.g. Acme"
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none text-white placeholder-gray-600"
                style={{ background: '#1a1a1a', border: '1px solid #1f1f1f' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                onBlur={(e) => (e.target.style.borderColor = '#1f1f1f')}
              />
            </div>
          </div>
        )}

        {error && <div className="text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {loading ? 'Generating...' : '✦ Generate Schema'}
        </button>
      </div>

      {schema && (
        <div className="mt-6 rounded-2xl border overflow-hidden" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1f1f1f' }}>
            <span className="text-xs font-semibold text-[#999] uppercase tracking-wide">JSON-LD</span>
            <button
              onClick={copy}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition"
              style={{ borderColor: '#1f1f1f', color: copied ? '#FFD4C2' : '#FF6B35' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-5 text-xs leading-relaxed overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightJson(schema) }} />
          </pre>
        </div>
      )}
    </div>
  )
}
