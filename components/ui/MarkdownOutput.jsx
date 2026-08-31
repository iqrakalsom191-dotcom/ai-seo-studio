function parseBold(line, keyPrefix = '') {
  const parts = line.split(/\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={`${keyPrefix}-b${i}`} style={{ color: '#FFD4C2' }} className="font-semibold">{part}</strong>
      : part
  )
}

export function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  const nodes = []
  let i = 0
  let listBuffer = []
  let listType = null

  function flushList() {
    if (listBuffer.length === 0) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    nodes.push(
      <Tag key={`list-${nodes.length}`} className="my-2 ml-1 space-y-1.5" style={{ listStyle: 'none' }}>
        {listBuffer}
      </Tag>
    )
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
      nodes.push(
        <pre key={`code-${nodes.length}`} className="my-3 rounded-lg p-4 overflow-x-auto text-sm" style={{ background: '#1a1a1a', color: '#FF6B35' }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    if (line.startsWith('# ')) {
      flushList()
      nodes.push(<h1 key={i} style={{ color: '#fff', fontSize: '24px' }} className="font-bold mt-6 mb-3">{parseBold(line.slice(2), i)}</h1>)
    } else if (line.startsWith('## ')) {
      flushList()
      nodes.push(<h2 key={i} style={{ color: '#FF6B35', fontSize: '20px' }} className="font-bold mt-5 mb-2">{parseBold(line.slice(3), i)}</h2>)
    } else if (line.startsWith('### ')) {
      flushList()
      nodes.push(<h3 key={i} style={{ color: '#FFD4C2', fontSize: '17px' }} className="font-semibold mt-4 mb-2">{parseBold(line.slice(4), i)}</h3>)
    } else if (line.startsWith('#### ')) {
      flushList()
      nodes.push(<h4 key={i} className="text-base font-semibold text-[#999] mt-3 mb-1">{parseBold(line.slice(5), i)}</h4>)
    } else if (line.startsWith('> ')) {
      flushList()
      nodes.push(
        <blockquote key={i} className="border-l-2 border-[#FF6B35] pl-4 my-2 italic" style={{ color: '#e5e5e5' }}>
          {parseBold(line.slice(2), i)}
        </blockquote>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(
        <li key={i} className="flex items-start gap-2.5" style={{ color: '#e5e5e5', lineHeight: 1.8 }}>
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF6B35' }} />
          <span>{parseBold(line.slice(2), i)}</span>
        </li>
      )
    } else if (line.match(/^\d+\. /)) {
      if (listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(
        <li key={i} className="list-decimal ml-5" style={{ color: '#e5e5e5', lineHeight: 1.8 }}>
          {parseBold(line.replace(/^\d+\. /, ''), i)}
        </li>
      )
    } else if (line.startsWith('---') || line.startsWith('***')) {
      flushList()
      nodes.push(<hr key={i} className="my-4" style={{ borderColor: '#1f1f1f' }} />)
    } else if (line.trim() === '') {
      flushList()
      nodes.push(<div key={i} className="h-2" />)
    } else {
      flushList()
      nodes.push(<p key={i} style={{ color: '#e5e5e5', lineHeight: 1.8 }} className="my-1">{parseBold(line, i)}</p>)
    }
    i++
  }
  flushList()
  return nodes
}

export function MarkdownContent({ text, className = '' }) {
  return (
    <div
      className={`overflow-y-auto max-h-[500px] rounded-xl px-5 py-4 text-sm ${className}`}
      style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: '12px' }}
    >
      {renderMarkdown(text)}
    </div>
  )
}

export function OutputTopBar({ wordCount, contentType }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
      {typeof wordCount === 'number' && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,107,53,0.12)', color: '#FF6B35' }}>
          {wordCount} words
        </span>
      )}
      {contentType && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,212,194,0.12)', color: '#FFD4C2' }}>
          {contentType}
        </span>
      )}
    </div>
  )
}
