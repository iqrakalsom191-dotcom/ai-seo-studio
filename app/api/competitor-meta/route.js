import { groq } from '@/lib/groq'
import { NextResponse } from 'next/server'

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

function isPrivateHost(hostname) {
  if (BLOCKED_HOSTS.includes(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
  if (/^169\.254\./.test(hostname)) return true
  return false
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    let parsed
    try {
      parsed = new URL(url.trim())
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol) || isPrivateHost(parsed.hostname)) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 })
    }

    let html
    try {
      const pageRes = await fetch(parsed.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-SEO-Studio/1.0)' },
        signal: AbortSignal.timeout(10000),
      })
      if (!pageRes.ok) {
        return NextResponse.json({ error: `Failed to fetch URL (status ${pageRes.status})` }, { status: 400 })
      }
      html = await pageRes.text()
    } catch (e) {
      return NextResponse.json({ error: 'Could not fetch the given URL' }, { status: 400 })
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i)
    const description = descMatch ? descMatch[1].trim() : ''

    const prompt = `You are an SEO expert. Analyze the following title tag and meta description scraped from a competitor's page, and give concise, actionable suggestions to improve them for SEO and click-through rate.

Title: "${title || '(none found)'}"
Meta Description: "${description || '(none found)'}"

Return the suggestions as plain text using short bullet points (start each with "- "). Do not include markdown headings or code fences.`

    const completion = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    })

    const analysis = completion.choices[0]?.message?.content?.trim() || ''

    return NextResponse.json({ title, description, analysis })

  } catch (error) {
    console.error('COMPETITOR META ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
