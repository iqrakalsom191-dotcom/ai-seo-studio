import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { checkAndIncrementUsage } from '@/lib/usage'
import { callAI } from '@/lib/ai-client'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await checkAndIncrementUsage(user.id)
    if (!usage.allowed) {
      return NextResponse.json({ error: 'Daily generation limit reached. Try again tomorrow.' }, { status: 429 })
    }

    const body = await request.json()
    const { topic, keyword } = body

    const content = await callAI(
      [
        {
          role: 'user',
          content: `Write an SEO title and meta description for topic: ${topic}, keyword: ${keyword}.
Strict requirements:
- TITLE must be no more than 60 characters (including spaces).
- DESCRIPTION must be no more than 155 characters (including spaces).
Format: TITLE: ... DESCRIPTION: ...`
        },
      ],
      user.id,
      supabase,
      'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.'
    )

    const titleMatch = content.match(/TITLE:\s*(.+)/i)
    const descMatch = content.match(/DESCRIPTION:\s*(.+)/i)

    let title = titleMatch?.[1]?.trim() || ''
    let description = descMatch?.[1]?.trim() || ''

    if (!title || !description) {
      return NextResponse.json({ error: 'Could not parse response', raw: content }, { status: 500 })
    }

    if (title.length > 60) title = title.slice(0, 60).trim()
    if (description.length > 155) description = description.slice(0, 155).trim()

    return NextResponse.json({ title, description, success: true })

  } catch (error) {
    console.error('META ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
