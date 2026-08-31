function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(line) {
  let html = escapeHtml(line)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  return html
}

// Converts the app's plain-markdown blog output into WordPress-ready HTML
// so headings, bold text, lists, etc. render styled instead of as raw text.
export function markdownToHtml(text) {
  if (!text) return ''
  const lines = text.split('\n')
  const html = []
  let i = 0
  let listBuffer = []
  let listType = null

  function flushList() {
    if (listBuffer.length === 0) return
    const tag = listType === 'ol' ? 'ol' : 'ul'
    html.push(`<${tag}>${listBuffer.join('')}</${tag}>`)
    listBuffer = []
    listType = null
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      flushList()
      html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
      i++
      continue
    }

    if (line.startsWith('#### ')) {
      flushList()
      html.push(`<h4>${inlineFormat(line.slice(5))}</h4>`)
    } else if (line.startsWith('### ')) {
      flushList()
      html.push(`<h3>${inlineFormat(line.slice(4))}</h3>`)
    } else if (line.startsWith('## ')) {
      flushList()
      html.push(`<h2>${inlineFormat(line.slice(3))}</h2>`)
    } else if (line.startsWith('# ')) {
      flushList()
      html.push(`<h1>${inlineFormat(line.slice(2))}</h1>`)
    } else if (line.startsWith('> ')) {
      flushList()
      html.push(`<blockquote><p>${inlineFormat(line.slice(2))}</p></blockquote>`)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(`<li>${inlineFormat(line.slice(2))}</li>`)
    } else if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(`<li>${inlineFormat(line.replace(/^\d+\.\s/, ''))}</li>`)
    } else if (line.startsWith('---') || line.startsWith('***')) {
      flushList()
      html.push('<hr />')
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      html.push(`<p>${inlineFormat(line)}</p>`)
    }
    i++
  }
  flushList()

  return html.join('\n')
}
