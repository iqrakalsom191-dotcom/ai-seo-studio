import { groq, stripThinkAndMeta } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, fields } = body

    if (!type || !fields) {
      return NextResponse.json({ error: 'Missing schema type or fields' }, { status: 400 })
    }

    let details = ''
    if (type === 'Article') {
      details = `Title: "${fields.title}"\nDescription: "${fields.description}"\nAuthor: "${fields.author}"\nDate published: "${fields.date}"`
    } else if (type === 'FAQ') {
      details = `Question and answer pairs (raw text, may need parsing):\n${fields.qa}`
    } else if (type === 'Product') {
      details = `Name: "${fields.name}"\nPrice: "${fields.price}"\nDescription: "${fields.description}"\nBrand: "${fields.brand}"`
    } else {
      return NextResponse.json({ error: 'Invalid schema type' }, { status: 400 })
    }

    const prompt = `Generate valid JSON-LD schema markup for schema.org type "${type}" using the following details:

${details}

Return ONLY the JSON-LD object, wrapped in a <script type="application/ld+json"> tag is NOT needed — return just the raw JSON object itself. Do not include markdown formatting, code fences, explanations, or any extra text — just the valid JSON.`

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.' },
        { role: 'user', content: prompt },
      ],
      reasoning_effort: 'none',
      max_tokens: 1500,
    })

    let raw = completion.choices[0]?.message?.content?.trim() || ''
    raw = stripThinkAndMeta(raw)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not generate schema' }, { status: 500 })
    }

    let schema
    try {
      schema = JSON.parse(jsonMatch[0])
    } catch (e) {
      return NextResponse.json({ error: 'Could not parse schema response' }, { status: 500 })
    }

    return NextResponse.json({ schema: JSON.stringify(schema, null, 2) })

  } catch (error) {
    console.error('SCHEMA GENERATOR ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
