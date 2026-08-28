import { groq, stripThinkAndMeta } from '@/lib/groq'
import { NextResponse } from 'next/server'

const PLATFORM_GUIDE = {
  Instagram: 'Write an engaging Instagram caption (with emojis, casual tone) followed by 8-12 relevant hashtags.',
  'Twitter/X': 'Write a punchy Twitter/X post under 280 characters, followed by 3-5 relevant hashtags.',
  LinkedIn: 'Write a professional, insightful LinkedIn post (3-5 short paragraphs) followed by 3-5 relevant hashtags.',
}

function fallbackParseCaptions(raw, platforms) {
  const results = []
  const lines = raw.split('\n')

  let currentPlatform = null
  let currentCaption = []

  const flush = () => {
    if (currentPlatform) {
      results.push({ platform: currentPlatform, caption: currentCaption.join('\n').trim() })
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const platformMatch = platforms.find((p) => new RegExp(`^#{0,3}\\s*\\**${p.replace('/', '\\/')}\\**[:.]?\\s*$`, 'i').test(trimmed))

    if (platformMatch) {
      flush()
      currentPlatform = platformMatch
      currentCaption = []
    } else if (currentPlatform && trimmed) {
      currentCaption.push(trimmed)
    }
  }
  flush()

  return results.filter((r) => r.platform && r.caption)
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

Return ONLY a JSON array, and nothing else. No preamble, no explanation, no markdown formatting, no code fences. The response must be valid JSON matching exactly this shape:
[{"platform": "Instagram", "caption": "..."}, ...]`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely. Output ONLY valid JSON, no markdown, no code fences, no commentary.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
    })

    let raw = completion.choices[0]?.message?.content?.trim() || ''
    raw = stripThinkAndMeta(raw)

    let results = null
    const jsonMatch = raw.match(/\[[\s\S]*\]/)

    if (jsonMatch) {
      try {
        results = JSON.parse(jsonMatch[0])
      } catch (e) {
        console.error('SOCIAL: JSON.parse failed:', e.message, '\nRaw content:', raw)
      }
    } else {
      console.error('SOCIAL: no JSON array found in raw content:', raw)
    }

    if (!Array.isArray(results)) {
      console.error('SOCIAL: falling back to text parsing. Raw content:', raw)
      results = fallbackParseCaptions(raw, validPlatforms)
    }

    results = results
      .filter((r) => r && r.platform && r.caption)
      .map((r) => ({ platform: String(r.platform).trim(), caption: String(r.caption).trim() }))

    if (results.length === 0) {
      console.error('SOCIAL: no captions could be extracted. Raw content:', raw)
      return NextResponse.json({ error: 'Could not generate captions' }, { status: 500 })
    }

    return NextResponse.json({ results })

  } catch (error) {
    console.error('SOCIAL ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
