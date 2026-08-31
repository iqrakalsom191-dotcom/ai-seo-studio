import Groq from 'groq-sdk'
import { stripThinkAndMeta } from '@/lib/groq'

export const GROQ_MODEL = 'qwen/qwen3.6-27b'

export async function getAIClient(userId, supabase) {
  if (userId && supabase) {
    const { data } = await supabase
      .from('user_ai_settings')
      .select('api_key')
      .eq('user_id', userId)
      .single()

    if (data?.api_key) {
      return { apiKey: data.api_key, model: GROQ_MODEL }
    }
  }

  return { apiKey: process.env.GROQ_API_KEY, model: GROQ_MODEL }
}

export async function callAI(messages, userId, supabase, systemPrompt) {
  const { apiKey, model } = await getAIClient(userId, supabase)

  const fullMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  const client = new Groq({ apiKey })
  const completion = await client.chat.completions.create({
    model,
    messages: fullMessages,
    reasoning_effort: 'none',
    max_tokens: 2048,
  })

  const raw = completion.choices[0]?.message?.content || ''
  return stripThinkAndMeta(raw)
}
