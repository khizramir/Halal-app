import { useState } from 'react'
import { submitFeedback } from '../lib/api'
import { FEEDBACK_CATEGORIES } from '../types'

const APP_VERSION = '1.0.0'

interface FeedbackWidgetProps {
  initialCategory?: string
  prefillMessage?: string
  trigger?: 'button' | 'inline'
  onClose?: () => void
}

export function FeedbackModal({ initialCategory, prefillMessage, onClose }: FeedbackWidgetProps) {
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState(initialCategory ?? 'general')
  const [message, setMessage] = useState(prefillMessage ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    await submitFeedback({ rating, category, message: message.trim() || undefined, appVersion: APP_VERSION })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-2xl">🙏</p>
            <p className="mt-2 font-semibold text-emerald-deep">Thank you! We read every message.</p>
            <button onClick={onClose} className="mt-4 w-full rounded-xl bg-emerald-deep py-2 text-sm font-semibold text-white">
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-emerald-deep">How are we doing?</h3>

            <div className="mt-3 flex justify-center gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={star <= rating ? 'text-amber-400' : 'text-gray-300'}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="mt-3 block text-sm font-medium text-gray-700">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {FEEDBACK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-sm font-medium text-gray-700">
              Tell us more (optional)
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-4 flex gap-2">
              <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="flex-1 rounded-xl bg-emerald-deep py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Feedback"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-deep text-xl text-white shadow-lg"
      >
        💬
      </button>
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  )
}
