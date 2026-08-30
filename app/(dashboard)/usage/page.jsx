'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Gauge, Zap } from 'lucide-react'

const DAILY_LIMIT = 50

function lastNDates(n) {
  const dates = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export default function UsagePage() {
  const [todayCount, setTodayCount] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dates = lastNDates(7)
      const today = dates[dates.length - 1]

      const { data } = await supabase
        .from('usage_tracking')
        .select('date, count')
        .eq('user_id', user.id)
        .in('date', dates)

      const byDate = Object.fromEntries((data || []).map((r) => [r.date, r.count]))
      setHistory(dates.map((date) => ({ date, count: byDate[date] || 0 })))
      setTodayCount(byDate[today] || 0)
      setLoading(false)
    }
    load()
  }, [])

  const remaining = Math.max(DAILY_LIMIT - todayCount, 0)
  const usedPct = Math.min((todayCount / DAILY_LIMIT) * 100, 100)
  const maxHistoryCount = Math.max(...history.map((h) => h.count), 1)

  return (
    <div className="max-w-3xl mx-auto p-6" style={{ background: '#09090B' }}>
      <div className="flex items-center gap-3 mb-2">
        <Gauge style={{ color: '#FF6B35' }} size={28} />
        <h1 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>Usage Limits</h1>
      </div>
      <p className="text-[#999] mb-8">Track your daily AI generation usage.</p>

      {!loading && (
        <>
          <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#999]">Today's usage</span>
              <span className="text-sm text-[#999]">{todayCount} / {DAILY_LIMIT}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#1a1a1a] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usedPct}%`,
                  background: usedPct >= 100 ? '#FF6B6B' : 'linear-gradient(90deg, #FF6B35, #FFD4C2)',
                }}
              />
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-5 mb-6 flex items-center gap-4">
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(255, 212, 194, 0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Zap style={{ color: '#FFD4C2' }} size={20} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: '#FAFAFA' }}>{remaining}</div>
              <div className="text-xs text-[#999]">generations remaining today</div>
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl shadow-sm border border-[#1f1f1f] p-6">
            <h2 className="text-sm font-semibold text-[#999] mb-4 uppercase tracking-wide">Last 7 Days</h2>
            <div className="flex items-end justify-between gap-2" style={{ height: '140px' }}>
              {history.map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs text-[#999]">{count}</span>
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${Math.max((count / maxHistoryCount) * 100, 4)}%`,
                      background: 'linear-gradient(180deg, #FF6B35, #FFD4C2)',
                    }}
                  />
                  <span className="text-[10px] text-[#999]">
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
