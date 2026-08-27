import { createClient } from './supabase-server'

export const DAILY_LIMIT = 5

function today() {
  return new Date().toISOString().slice(0, 10)
}

export async function checkAndIncrementUsage(userId) {
  const supabase = await createClient()
  const date = today()

  const { data: existing, error: fetchError } = await supabase
    .from('usage_tracking')
    .select('id, count')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (fetchError) {
    throw new Error('Failed to check usage')
  }

  const currentCount = existing?.count || 0

  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, count: currentCount, limit: DAILY_LIMIT }
  }

  if (existing) {
    await supabase.from('usage_tracking').update({ count: currentCount + 1 }).eq('id', existing.id)
  } else {
    await supabase.from('usage_tracking').insert({ user_id: userId, date, count: 1 })
  }

  return { allowed: true, count: currentCount + 1, limit: DAILY_LIMIT }
}
