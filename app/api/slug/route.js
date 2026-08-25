import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { keyword } = body

    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Missing keyword' }, { status: 400 })
    }

    const prompt = `Generate 5 SEO-friendly URL slugs for the keyword "${keyword}". Each slug should be short, lowercase, use hyphens instead of spaces, contain no special characters, and be optimized for search engines. Return only the 5 slugs, one per line, with no numbering, bullets, quotes, or preamble.`

    const completion = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const slugs = raw
      .split('\n')
      .map((line) =>
        line
          .replace(/^[-*•\d.)\s]+/, '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      )
      .filter((line) => line.length > 0)
      .slice(0, 5)

    if (slugs.length === 0) {
      return NextResponse.json({ error: 'Could not generate slugs' }, { status: 500 })
    }

    return NextResponse.json({ slugs })

  } catch (error) {
    console.error('SLUG ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
