import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const INSTRUCTIONS = {
  'Improve Writing': 'Improve the writing quality, clarity, and flow of the following content while keeping the original meaning intact.',
  'SEO Optimize': 'Rewrite the following content to be SEO-optimized, naturally incorporating relevant keywords and improving readability, without changing the core meaning.',
  'Rewrite': 'Rewrite the following content in a fresh way, using different phrasing while preserving the original meaning.',
  'Make Shorter': 'Make the following content more concise, removing redundancy while preserving the key points.',
  'Make Longer': 'Expand the following content with more detail, examples, and depth while keeping it coherent and on-topic.',
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { content, type } = body

    if (!content || !type) {
      return NextResponse.json({ error: 'Missing content or type' }, { status: 400 })
    }

    const instruction = INSTRUCTIONS[type] || INSTRUCTIONS['Improve Writing']

    const completion = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [{
        role: 'user',
        content: `${instruction}\n\nContent:\n${content}\n\nReturn only the improved content, with no preamble or explanation.`
      }],
      max_tokens: 2000,
    })

    const improved = completion.choices[0]?.message?.content?.trim() || ''

    if (!improved) {
      return NextResponse.json({ error: 'Could not generate improved content' }, { status: 500 })
    }

    return NextResponse.json({ improved, success: true })

  } catch (error) {
    console.error('IMPROVER ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
