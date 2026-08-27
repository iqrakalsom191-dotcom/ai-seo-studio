import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { checkAndIncrementUsage } from '@/lib/usage'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

    const { keyword } = await request.json()

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [{
        role: 'user',
        content: `Analyze this SEO keyword: "${keyword}"

Reply in exactly this format:
INTENT: informational
DIFFICULTY: medium
RELATED: keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10
LSI: lsi1, lsi2, lsi3, lsi4, lsi5
TIPS: tip one here | tip two here | tip three here`
      }],
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content || ''
    console.log('KEYWORD RESPONSE:', content)

    const intentMatch = content.match(/INTENT:\s*(.+)/i)
    const diffMatch = content.match(/DIFFICULTY:\s*(.+)/i)
    const relatedMatch = content.match(/RELATED:\s*(.+)/i)
    const lsiMatch = content.match(/LSI:\s*(.+)/i)
    const tipsMatch = content.match(/TIPS:\s*(.+)/i)

    const intent = intentMatch?.[1]?.trim() || 'Informational'
    const difficulty = diffMatch?.[1]?.trim() || 'Medium'
    const related = relatedMatch?.[1]?.split(',').map(k => k.trim()).filter(Boolean) || []
    const lsi = lsiMatch?.[1]?.split(',').map(k => k.trim()).filter(Boolean) || []
    const tips = tipsMatch?.[1]?.split('|').map(t => t.trim()).filter(Boolean) || []

    return NextResponse.json({ intent, difficulty, related, lsi, tips, success: true })

  } catch (error) {
    console.error('KEYWORD ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
