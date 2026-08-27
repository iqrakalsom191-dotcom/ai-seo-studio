import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
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

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    })

    const recommendations = completion.choices[0]?.message?.content?.trim() || ''

    if (!recommendations) {
      return NextResponse.json({ error: 'Could not generate recommendations' }, { status: 500 })
    }

    return NextResponse.json({ recommendations })

  } catch (error) {
    console.error('WORD COUNT ANALYZER ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
