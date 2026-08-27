import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { topic } = body

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
    }

    const prompt = `Generate 10 SEO-optimized FAQs about "${topic}". For each FAQ, provide a clear, search-friendly question and a concise, informative answer (2-4 sentences).

Return the result strictly as a JSON array with no preamble, no markdown formatting, and no code fences, in this exact shape:
[{"question": "...", "answer": "..."}, ...]`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    })

    let raw = completion.choices[0]?.message?.content?.trim() || ''
    raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
    const jsonMatch = raw.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not generate FAQs' }, { status: 500 })
    }

    let faqs
    try {
      faqs = JSON.parse(jsonMatch[0])
    } catch (e) {
      return NextResponse.json({ error: 'Could not parse FAQ response' }, { status: 500 })
    }

    faqs = faqs
      .filter((f) => f && f.question && f.answer)
      .map((f) => ({ question: String(f.question).trim(), answer: String(f.answer).trim() }))
      .slice(0, 10)

    if (faqs.length === 0) {
      return NextResponse.json({ error: 'Could not generate FAQs' }, { status: 500 })
    }

    return NextResponse.json({ faqs })

  } catch (error) {
    console.error('FAQ ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
