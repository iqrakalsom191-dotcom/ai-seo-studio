import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

const PLATFORM_GUIDE = {
  Instagram: 'Write an engaging Instagram caption (with emojis, casual tone) followed by 8-12 relevant hashtags.',
  'Twitter/X': 'Write a punchy Twitter/X post under 280 characters, followed by 3-5 relevant hashtags.',
  LinkedIn: 'Write a professional, insightful LinkedIn post (3-5 short paragraphs) followed by 3-5 relevant hashtags.',
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { content, platforms } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 })
    }

    const validPlatforms = platforms.filter((p) => PLATFORM_GUIDE[p])
    if (validPlatforms.length === 0) {
      return NextResponse.json({ error: 'No valid platforms selected' }, { status: 400 })
    }

    const prompt = `Based on the following blog content, generate social media captions for these platforms: ${validPlatforms.join(', ')}.

For each platform, follow this guidance:
${validPlatforms.map((p) => `${p}: ${PLATFORM_GUIDE[p]}`).join('\n')}

Blog content:
${content}

Return the result strictly as a JSON array with no preamble, no markdown formatting, and no code fences, in this exact shape:
[{"platform": "Instagram", "caption": "..."}, ...]`

    const completion = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const jsonMatch = raw.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not generate captions' }, { status: 500 })
    }

    let results
    try {
      results = JSON.parse(jsonMatch[0])
    } catch (e) {
      return NextResponse.json({ error: 'Could not parse caption response' }, { status: 500 })
    }

    results = results
      .filter((r) => r && r.platform && r.caption)
      .map((r) => ({ platform: String(r.platform).trim(), caption: String(r.caption).trim() }))

    if (results.length === 0) {
      return NextResponse.json({ error: 'Could not generate captions' }, { status: 500 })
    }

    return NextResponse.json({ results })

  } catch (error) {
    console.error('SOCIAL ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
