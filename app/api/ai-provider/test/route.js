import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      throw new Error('Invalid Groq API key or connection failed')
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Connection test failed' }, { status: 400 })
  }
}
