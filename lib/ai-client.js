import Groq from 'groq-sdk'
import { stripThinkAndMeta } from '@/lib/groq'

const DEFAULT_PROVIDER = 'groq'
const DEFAULT_MODEL = 'qwen/qwen3-27b'

export async function getAIClient(userId, supabase) {
  if (userId && supabase) {
    const { data } = await supabase
      .from('user_ai_settings')
      .select('provider, api_key, model')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (data?.api_key) {
      return { provider: data.provider, apiKey: data.api_key, model: data.model }
    }
  }

  return { provider: DEFAULT_PROVIDER, apiKey: process.env.GROQ_API_KEY, model: DEFAULT_MODEL }
}

async function callGroq({ apiKey, model, messages }) {
  console.log('Using model:', model)
  const client = new Groq({ apiKey })
  const completion = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 2048,
  })
  return completion.choices[0]?.message?.content || ''
}

async function callOpenAI({ apiKey, model, messages }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI request failed: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callGemini({ apiKey, model, messages }) {
  const systemMessages = messages.filter((m) => m.role === 'system')
  const conversation = messages.filter((m) => m.role !== 'system')

  const contents = conversation.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body = { contents }
  if (systemMessages.length > 0) {
    body.systemInstruction = { parts: [{ text: systemMessages.map((m) => m.content).join('\n') }] }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini request failed: ${err}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
}

async function callClaude({ apiKey, model, messages }) {
  const systemMessages = messages.filter((m) => m.role === 'system')
  const conversation = messages.filter((m) => m.role !== 'system')

  const body = {
    model,
    max_tokens: 2048,
    messages: conversation.map((m) => ({ role: m.role, content: m.content })),
  }

  if (systemMessages.length > 0) {
    body.system = systemMessages.map((m) => m.content).join('\n')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude request failed: ${err}`)
  }

  const data = await res.json()
  return data.content?.map((c) => c.text).join('') || ''
}

export async function callAI(messages, userId, supabase, systemPrompt) {
  const { provider, apiKey, model } = await getAIClient(userId, supabase)

  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  let raw = ''
  switch (provider) {
    case 'openai':
      raw = await callOpenAI({ apiKey, model, messages: fullMessages })
      break
    case 'gemini':
      raw = await callGemini({ apiKey, model, messages: fullMessages })
      break
    case 'claude':
      raw = await callClaude({ apiKey, model, messages: fullMessages })
      break
    case 'groq':
    default:
      raw = await callGroq({ apiKey, model, messages: fullMessages })
      break
  }

  return stripThinkAndMeta(raw)
}
