import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('projects')
      .select('id, keyword, status, current_step, wordpress_status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ projects: data || [] })
  } catch (error) {
    console.error('PROJECTS GET ERROR:', error)
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

    const { keyword } = await request.json()
    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, keyword: keyword.trim() })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('PROJECTS POST ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
