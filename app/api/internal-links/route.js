import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { callAI } from '@/lib/ai-client'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { content, urls } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }
    if (!urls || !urls.trim()) {
      return NextResponse.json({ error: 'Missing URL list' }, { status: 400 })
    }

    const urlList = urls.split('\n').map((u) => u.trim()).filter(Boolean)

    const prompt = `You are an SEO expert. Given the following content and a list of existing URLs on the same site, suggest which URLs are most relevant to link to internally from this content, along with a suggested anchor text and a short reason for each suggestion.

Content:
"""
${content}
"""

Existing URLs:
${urlList.map((u) => `- ${u}`).join('\n')}

Return ONLY a JSON array (no markdown, no code fences, no extra text) where each item has the shape:
{ "url": "...", "anchor": "...", "reason": "..." }

Only include URLs from the list above that are genuinely relevant. Do not invent new URLs.`

    const raw = await callAI(
      [{ role: 'user', content: prompt }],
      user?.id,
      supabase,
      'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.'
    )
    const jsonMatch = raw.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not generate suggestions' }, { status: 500 })
    }

    let suggestions
    try {
      suggestions = JSON.parse(jsonMatch[0])
    } catch (e) {
      return NextResponse.json({ error: 'Could not parse suggestions response' }, { status: 500 })
    }

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('INTERNAL LINKS ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
