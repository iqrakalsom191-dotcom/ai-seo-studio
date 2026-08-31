import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const PATCHABLE_FIELDS = [
  'status',
  'current_step',
  'keyword_analysis',
  'selected_title',
  'meta_title',
  'meta_description',
  'slug',
  'faqs',
  'schema',
  'competitor_notes',
  'generated_content',
  'wordpress_status',
  'wordpress_post_url',
]

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project: data })
  } catch (error) {
    console.error('PROJECT GET ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates = {}
    for (const field of PATCHABLE_FIELDS) {
      if (field in body) updates[field] = body[field]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ project: data })
  } catch (error) {
    console.error('PROJECT PATCH ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PROJECT DELETE ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
