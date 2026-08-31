import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .select('rating, comment, tool, created_at')
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) throw error

    return NextResponse.json({ reviews: data || [] })
  } catch (error) {
    console.error('REVIEWS GET ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tool, rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'A rating between 1 and 5 is required' }, { status: 400 })
    }

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      tool: tool || null,
      rating,
      comment: comment?.trim() || null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('REVIEWS POST ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
