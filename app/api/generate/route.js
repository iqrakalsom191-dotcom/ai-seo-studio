import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { checkAndIncrementUsage } from '@/lib/usage'
import { callAI } from '@/lib/ai-client'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await checkAndIncrementUsage(user.id)
    if (!usage.allowed) {
      return NextResponse.json({ error: 'Daily generation limit reached. Try again tomorrow.' }, { status: 429 })
    }

    const { keyword, tone, wordCount, language } = await request.json()

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const prompt = `Write a ${tone} blog post about "${keyword}" in ${language}. 
The blog post should be approximately ${wordCount} words.
Include a compelling title, introduction, main body with subheadings, and a conclusion.
Format it in plain text with clear sections.`

    const content = await callAI(
      [{ role: 'user', content: prompt }],
      user.id,
      supabase,
      'You are a helpful assistant. Never use <think> tags or show reasoning. Respond directly and concisely.'
    )
    return NextResponse.json({ content, success: true })

  } catch (error) {
    console.error('GROQ ERROR:', error.stack || error)
    return NextResponse.json({ error: 'Generation failed', stack: error.stack }, { status: 500 })
  }
}
