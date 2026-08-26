import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { keyword } = body

    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Missing keyword' }, { status: 400 })
    }

    const prompt = `Generate 10 catchy, SEO-optimized blog title options for the keyword "${keyword}". Each title should be attention-grabbing, click-worthy, and optimized for search engines. Return only the 10 titles, one per line, with no numbering, bullets, quotes, or preamble.`

    const completion = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const titles = raw
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 10)

    if (titles.length === 0) {
      return NextResponse.json({ error: 'Could not generate titles' }, { status: 500 })
    }

    return NextResponse.json({ titles })

  } catch (error) {
    console.error('TITLE GENERATOR ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
