import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { callAI } from '@/lib/ai-client'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { content, keyword } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const prompt = `You are an SEO expert. Analyze the following content${keyword ? ` targeting the keyword "${keyword}"` : ''} and give concise, actionable SEO recommendations (content length, keyword usage/placement, readability, structure, etc.).

Content:
"""
${content}
"""

Return the recommendations as plain text, using short bullet points (start each with "- "). Do not include markdown headings or code fences.`

    const recommendations = await callAI(
      [{ role: 'user', content: prompt }],
      user?.id,
      supabase,
      'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.'
    )

    if (!recommendations) {
      return NextResponse.json({ error: 'Could not generate recommendations' }, { status: 500 })
    }

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('WORD COUNT ANALYZER ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
