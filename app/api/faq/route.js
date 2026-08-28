import { groq, stripThinkAndMeta } from '@/lib/groq'
import { NextResponse } from 'next/server'

function fallbackParseFaqs(raw) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  const faqs = []
  let currentQuestion = null
  let currentAnswer = []

  for (const line of lines) {
    const qMatch = line.match(/^(?:\d+[.)]\s*)?(?:Q(?:uestion)?[:.]?\s*)(.+)$/i)
    const aMatch = line.match(/^(?:A(?:nswer)?[:.]?\s*)(.+)$/i)

    if (qMatch && !aMatch) {
      if (currentQuestion) {
        faqs.push({ question: currentQuestion, answer: currentAnswer.join(' ').trim() })
      }
      currentQuestion = qMatch[1].trim()
      currentAnswer = []
    } else if (aMatch && currentQuestion) {
      currentAnswer.push(aMatch[1].trim())
    } else if (currentQuestion) {
      currentAnswer.push(line)
    }
  }

  if (currentQuestion) {
    faqs.push({ question: currentQuestion, answer: currentAnswer.join(' ').trim() })
  }

  return faqs.filter((f) => f.question && f.answer)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { topic } = body

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
    }

    const prompt = `Generate 10 SEO-optimized FAQs about "${topic}". For each FAQ, provide a clear, search-friendly question and a concise, informative answer (2-4 sentences).

Return ONLY a JSON array with 10 items, and nothing else. No preamble, no explanation, no markdown formatting, no code fences. The response must be valid JSON matching exactly this shape:
[{"question": "...", "answer": "..."}, ...]`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely. Output ONLY valid JSON, no markdown, no code fences, no commentary.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
    })

    let raw = completion.choices[0]?.message?.content?.trim() || ''
    raw = stripThinkAndMeta(raw)

    let faqs = null
    const jsonMatch = raw.match(/\[[\s\S]*\]/)

    if (jsonMatch) {
      try {
        faqs = JSON.parse(jsonMatch[0])
      } catch (e) {
        console.error('FAQ: JSON.parse failed:', e.message, '\nRaw content:', raw)
      }
    } else {
      console.error('FAQ: no JSON array found in raw content:', raw)
    }

    if (!Array.isArray(faqs)) {
      console.error('FAQ: falling back to text parsing. Raw content:', raw)
      faqs = fallbackParseFaqs(raw)
    }

    faqs = faqs
      .filter((f) => f && f.question && f.answer)
      .map((f) => ({ question: String(f.question).trim(), answer: String(f.answer).trim() }))
      .slice(0, 10)

    if (faqs.length === 0) {
      console.error('FAQ: no FAQs could be extracted. Raw content:', raw)
      return NextResponse.json({ error: 'Could not generate FAQs' }, { status: 500 })
    }

    return NextResponse.json({ faqs })

  } catch (error) {
    console.error('FAQ ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
