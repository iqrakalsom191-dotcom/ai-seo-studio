'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'

const TYPE_COLORS = {
  blog: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  meta: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  social: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('blog')
  const [keyword, setKeyword] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [year, month])

  async function fetchEntries() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    const start = toDateStr(year, month, 1)
    const endDate = new Date(year, month + 1, 0).getDate()
    const end = toDateStr(year, month, endDate)

    const { data, error } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('user_id', user.id)
      .gte('planned_date', start)
      .lte('planned_date', end)
      .order('planned_date', { ascending: true })

    if (!error) setEntries(data || [])
    setLoading(false)
  }

  async function handleAdd() {
    if (!title.trim() || !plannedDate) return setError('Title and date are required')
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('content_calendar')
        .insert({
          user_id: user.id,
          title,
          content_type: contentType,
          keyword,
          planned_date: plannedDate,
        })
        .select()
        .single()

      if (error) throw error

      setEntries((prev) => [...prev, data].sort((a, b) => a.planned_date.localeCompare(b.planned_date)))
      setTitle('')
      setKeyword('')
      setPlannedDate('')
      setContentType('blog')
      setShowForm(false)
      toast.success('Content plan added')
    } catch (e) {
      setError(e.message || 'Failed to save entry')
      toast.error(e.message || 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('content_calendar').delete().eq('id', id)
      if (error) throw error
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success('Deleted')
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const entriesByDay = {}
  for (const e of entries) {
    const day = parseInt(e.planned_date.split('-')[2], 10)
    if (!entriesByDay[day]) entriesByDay[day] = []
    entriesByDay[day].push(e)
  }

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <CalendarDays style={{ color: '#7C3AED' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>Content Calendar</h1>
      </div>
      <p className="text-[#999] mb-6">Plan and track your content across blog, meta, and social.</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-[#1f1f1f] hover:bg-[#1a1a1a] transition"
          >
            <ChevronLeft size={18} style={{ color: '#7C3AED' }} />
          </button>
          <span className="text-lg font-semibold text-white w-40 text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-[#1f1f1f] hover:bg-[#1a1a1a] transition"
          >
            <ChevronRight size={18} style={{ color: '#7C3AED' }} />
          </button>
        </div>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
          style={{ backgroundColor: '#7C3AED' }}
        >
          <Plus size={16} />
          Add Content Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">New Content Plan</span>
            <button onClick={() => setShowForm(false)}>
              <X size={18} className="text-[#999]" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best coffee makers guide"
                className="w-full border bg-[#1a1a1a] text-white placeholder-gray-600 border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full border bg-[#1a1a1a] text-white border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              >
                <option value="blog">Blog</option>
                <option value="meta">Meta</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Target Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. best coffee makers"
                className="w-full border bg-[#1a1a1a] text-white placeholder-gray-600 border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#999] mb-1">Planned Date</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full border bg-[#1a1a1a] text-white border-[#1f1f1f] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {error && <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#7C3AED' }}
          >
            {saving ? 'Saving...' : 'Save Content Plan'}
          </button>
        </div>
      )}

      <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#1f1f1f]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-[#999] uppercase">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((d, i) => (
            <div
              key={i}
              className="min-h-[110px] border-b border-r border-[#1f1f1f] p-2 align-top"
              style={{ backgroundColor: d && isToday(d) ? 'rgba(124,58,237,0.08)' : '#111111' }}
            >
              {d && (
                <>
                  <div
                    className="text-xs font-semibold mb-1.5"
                    style={{ color: isToday(d) ? '#7C3AED' : '#999999' }}
                  >
                    {d}
                  </div>
                  <div className="space-y-1">
                    {(entriesByDay[d] || []).map((entry) => {
                      const badge = TYPE_COLORS[entry.content_type] || TYPE_COLORS.blog
                      return (
                        <div
                          key={entry.id}
                          className="group flex items-start justify-between gap-1 px-2 py-1 rounded-md text-[11px] leading-tight"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          <span className="font-medium break-words">{entry.title}</span>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-[#999] mt-4">Loading...</p>}
    </div>
  )
}
