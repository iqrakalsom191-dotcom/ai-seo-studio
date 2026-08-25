import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const { keyword, tone, wordCount, language } = await request.json()

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const prompt = `Write a ${tone} blog post about "${keyword}" in ${language}. 
The blog post should be approximately ${wordCount} words.
Include a compelling title, introduction, main body with subheadings, and a conclusion.
Format it in plain text with clear sections.`

    const completion = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    })

    const content = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ content, success: true })

  } catch (error) {
    console.error('GROQ ERROR:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
