import Groq from 'groq-sdk'

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Strips <think> reasoning blocks plus any leftover markdown meta-commentary
// (e.g. "**Thinking Process:**" or "* Deconstruct the request...") that some
// models emit outside the <think> tags.
export function stripThinkAndMeta(text) {
  let cleaned = (text || '').replace(/<think>[\s\S]*?<\/think>/gi, '')
  cleaned = cleaned.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '')

  cleaned = cleaned
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      if (/^\*\*[^*]+:\*\*\s*$/.test(trimmed)) return false
      if (/^\*\s+.*(deconstruct|thinking process|reasoning|let me|i need to|i should|first,? i|okay,|plan:)/i.test(trimmed)) return false
      return true
    })
    .join('\n')

  return cleaned.trim()
}

export async function generateContent({ keyword, tone, wordCount, language }) {
  const prompt = `Write a ${tone} blog post about "${keyword}" in ${language}. 
The blog post should be approximately ${wordCount} words.
Include a compelling title, introduction, main body with subheadings, and a conclusion.
Format it in plain text with clear sections.`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  })

  return completion.choices[0]?.message?.content || ''
}
