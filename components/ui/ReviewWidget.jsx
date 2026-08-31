'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Star, MessageSquarePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import useGuestGuard from '@/hooks/useGuestGuard'
import GuestModal from '@/components/ui/GuestModal'

export default function ReviewWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { showModal, setShowModal, guardedAction } = useGuestGuard()

  const openWidget = guardedAction(() => setOpen(true))

  const closeWidget = () => {
    setOpen(false)
    setTimeout(() => {
      setRating(0)
      setHoverRating(0)
      setComment('')
      setSubmitted(false)
    }, 200)
  }

  const submit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: pathname, rating, comment: comment.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')
      setSubmitted(true)
      toast.success('Thanks for your feedback!')
      setTimeout(closeWidget, 1500)
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={openWidget}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
        style={{ background: '#FF6B35', boxShadow: '0 8px 24px rgba(255,107,53,0.35)' }}
      >
        <MessageSquarePlus size={18} />
        <span className="hidden sm:inline">Rate this tool</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={closeWidget}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6"
            style={{ background: '#111', border: '1px solid #1f1f1f' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>
                {submitted ? 'Thanks!' : 'How was this tool?'}
              </h3>
              <button onClick={closeWidget} className="text-[#999] hover:text-white">
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <p className="text-sm" style={{ color: '#e5e5e5' }}>
                Your feedback helps us improve AI SEO Studio. 🎉
              </p>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        size={28}
                        color="#FFD4C2"
                        fill={(hoverRating || rating) >= star ? '#FFD4C2' : 'transparent'}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think (optional)"
                  rows={3}
                  className="w-full bg-[#1a1a1a] text-white placeholder-gray-600 border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none mb-4"
                />

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <GuestModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
