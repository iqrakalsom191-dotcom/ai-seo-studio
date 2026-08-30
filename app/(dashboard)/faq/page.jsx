'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
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
        toast.error(data.error || 'FAQ generation failed')
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
        <HelpCircle style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>FAQ Generator</h1>
      </div>
      <p className="text-[#999] mb-8">Enter a topic and get 10 SEO-optimized FAQs.</p>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#999] mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. email marketing automation"
            className="w-full border bg-[#1a1a1a] text-white placeholder-gray-600 border-[#1f1f1f] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        {error && <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
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
                className="bg-[#111] rounded-2xl border border-[#1f1f1f] shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: '#FF6B35',
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="px-5 pb-4 text-sm text-[#999] leading-relaxed"
                    style={{ borderTop: `1px solid rgba(255, 212, 194, 0.2)`, paddingTop: '12px' }}
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
