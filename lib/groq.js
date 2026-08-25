import Groq from 'groq-sdk'

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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
