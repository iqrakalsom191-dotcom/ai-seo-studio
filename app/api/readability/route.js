import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!word) return 0
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

function analyzeText(content) {
  const words = content.trim().match(/[A-Za-z']+/g) || []
  const sentences = content.trim().split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0)
  const wordCount = words.length
  const sentenceCount = Math.max(sentences.length, 1)
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0)

  const score = wordCount > 0 && sentenceCount > 0
    ? 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)
    : 0

  const clampedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10))

  let readingLevel
  if (clampedScore >= 90) readingLevel = 'Very Easy (5th grade)'
  else if (clampedScore >= 80) readingLevel = 'Easy (6th grade)'
  else if (clampedScore >= 70) readingLevel = 'Fairly Easy (7th grade)'
  else if (clampedScore >= 60) readingLevel = 'Standard (8th-9th grade)'
  else if (clampedScore >= 50) readingLevel = 'Fairly Difficult (10th-12th grade)'
  else if (clampedScore >= 30) readingLevel = 'Difficult (College)'
  else readingLevel = 'Very Difficult (College graduate)'

  return { score: clampedScore, readingLevel, wordCount, sentenceCount }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const { score, readingLevel, wordCount, sentenceCount } = analyzeText(content)

    const prompt = `You are a readability expert. Given the following content and its Flesch Reading Ease score of ${score} (${readingLevel}), provide 3-5 concise, actionable suggestions to improve its readability. Return only a plain list of suggestions, one per line, with no numbering, bullets, or preamble.\n\nContent:\n${content}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const suggestions = raw
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((line) => line.length > 0)

    return NextResponse.json({ score, readingLevel, wordCount, sentenceCount, suggestions })

  } catch (error) {
    console.error('READABILITY ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
