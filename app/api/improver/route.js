import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

function buildPrompt(content, type) {
  switch (type) {
    case 'Improve Writing':
      return `Improve the grammar, clarity, and flow of the following content while keeping its original meaning intact.\n\nContent:\n${content}`
    case 'SEO Optimize':
      return `Rewrite the following content to be SEO-optimized. Naturally incorporate relevant keywords, improve headings/structure, and make it meta-description friendly, without changing the core meaning.\n\nContent:\n${content}`
    case 'Rewrite':
      return `Completely rewrite the following content using different wording and structure, while keeping the same meaning.\n\nContent:\n${content}`
    case 'Make Shorter':
      return `Condense the following content to approximately half its original length, preserving the key points.\n\nContent:\n${content}`
    case 'Make Longer':
      return `Expand the following content with more detail, examples, and depth while keeping it coherent and on-topic.\n\nContent:\n${content}`
    default:
      return `Improve the grammar, clarity, and flow of the following content while keeping its original meaning intact.\n\nContent:\n${content}`
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { content, type } = body

    if (!content || !type) {
      return NextResponse.json({ error: 'Missing content or type' }, { status: 400 })
    }

    const prompt = `${buildPrompt(content, type)}\n\nReturn only the improved content, with no preamble or explanation.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    })

    const result = completion.choices[0]?.message?.content?.trim() || ''

    if (!result) {
      return NextResponse.json({ error: 'Could not generate improved content' }, { status: 500 })
    }

    return NextResponse.json({ result })

  } catch (error) {
    console.error('IMPROVER ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
