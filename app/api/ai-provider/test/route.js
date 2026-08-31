import { NextResponse } from 'next/server'

async function testGroq(apiKey) {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error('Invalid Groq API key or connection failed')
}

async function testOpenAI(apiKey) {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error('Invalid OpenAI API key or connection failed')
}

async function testGemini(apiKey) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  if (!res.ok) throw new Error('Invalid Gemini API key or connection failed')
}

async function testClaude(apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  })
  if (!res.ok) throw new Error('Invalid Claude API key or connection failed')
}

export async function POST(request) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key are required' }, { status: 400 })
    }

    switch (provider) {
      case 'groq':
        await testGroq(apiKey)
        break
      case 'openai':
        await testOpenAI(apiKey)
        break
      case 'gemini':
        await testGemini(apiKey)
        break
      case 'claude':
        await testClaude(apiKey)
        break
      default:
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Connection test failed' }, { status: 400 })
  }
}
