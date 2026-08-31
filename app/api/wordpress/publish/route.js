import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { markdownToHtml } from '@/lib/markdown-to-html'

export async function POST(request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, status = 'draft' } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const { data: creds, error: credsError } = await supabase
      .from('wordpress_credentials')
      .select('site_url, username, app_password')
      .eq('user_id', user.id)
      .single()

    if (credsError || !creds) {
      return NextResponse.json({ error: 'WordPress credentials not found. Please connect your site first.' }, { status: 404 })
    }

    const siteUrl = creds.site_url.replace(/\/$/, '')
    const token = Buffer.from(`${creds.username}:${creds.app_password}`).toString('base64')

    const wpResponse = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content: markdownToHtml(content),
        status,
      }),
    })

    if (!wpResponse.ok) {
      const wpError = await wpResponse.json()
      return NextResponse.json({ error: wpError.message || 'WordPress publish failed' }, { status: wpResponse.status })
    }

    const wpPost = await wpResponse.json()

    return NextResponse.json({
      success: true,
      postId: wpPost.id,
      postUrl: wpPost.link,
      editUrl: `${siteUrl}/wp-admin/post.php?post=${wpPost.id}&action=edit`,
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
