'use client'
import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'

export default function FaqPage() {
  const [topic, setTopic] = useState('')
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openIndex, setOpenIndex] = useState(null)

  const generate = async () => {
    if (!topic.trim()) return setError('Please enter a topic first')
    setLoading(true)
    setError('')
    setFaqs([])
    setOpenIndex(null)

    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()
      if (res.ok && data.faqs) {
        setFaqs(data.faqs)
      } else {
        setError(data.error || 'FAQ generation failed')
      }
    } catch (e) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle style={{ color: '#6C47FF' }} size={28} />
        <h1 className="text-2xl font-bold text-gray-900">FAQ Generator</h1>
      </div>
      <p className="text-gray-500 mb-8">Enter a topic and get 10 SEO-optimized FAQs.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. email marketing automation"
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
          {loading ? 'Generating...' : '✦ Generate FAQs'}
        </button>
      </div>

      {faqs.length > 0 && (
        <div className="mt-6 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: '#6C47FF',
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="px-5 pb-4 text-sm text-gray-600 leading-relaxed"
                    style={{ borderTop: `1px solid rgba(0,198,174,0.2)`, paddingTop: '12px' }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
