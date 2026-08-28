import { groq, stripThinkAndMeta } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { keyword } = body

    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Missing keyword' }, { status: 400 })
    }

    const prompt = `Generate exactly 10 catchy, SEO-optimized blog title options for the keyword "${keyword}". Each title should be attention-grabbing, click-worthy, and optimized for search engines.

Strict requirement: each title must be no more than 60 characters (including spaces).

Return ONLY the 10 titles, one per line. Do not include numbering, bullets, quotes, explanations, reasoning, or any extra text — just the 10 titles and nothing else.`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.' },
        { role: 'user', content: prompt },
      ],
      reasoning_effort: 'none',
      max_tokens: 500,
    })

    let raw = completion.choices[0]?.message?.content?.trim() || ''
    raw = stripThinkAndMeta(raw)

    if (!raw) {
      return NextResponse.json({ error: 'Could not generate titles' }, { status: 500 })
    }

    const titles = raw
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.length > 60 ? t.slice(0, 60).trim() : t))
      .join('\n')

    return NextResponse.json({ titles })

  } catch (error) {
    console.error('TITLE GENERATOR ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
