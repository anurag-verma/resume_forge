import { Fragment, createElement, type ReactNode } from 'react'

/**
 * Renders a constrained "markdown-lite" syntax (bold, italic, bullet lists)
 * into React elements — never HTML strings. Only `<strong>`, `<em>`, `<ul>`,
 * `<li>`, and `<br>` are ever created, and all user text is passed as
 * children (React escapes text nodes; it never parses them as markup), so
 * there is no path to inject a script, a `javascript:` link, or an
 * event-handler attribute. See Security doc §4.1.
 */
export function renderMarkdownLite(raw: string): ReactNode {
  const lines = raw.split('\n')
  const nodes: ReactNode[] = []
  let listBuffer: string[] = []
  let key = 0

  function flushList() {
    if (listBuffer.length === 0) return
    const items = listBuffer
    nodes.push(
      createElement(
        'ul',
        { key: `ul-${key++}` },
        items.map((item, itemIndex) =>
          createElement('li', { key: itemIndex }, parseInline(item, `li-${key}-${itemIndex}`)),
        ),
      ),
    )
    listBuffer = []
  }

  lines.forEach((line, index) => {
    const bulletMatch = /^[-*]\s+(.*)$/.exec(line)
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1])
      return
    }
    flushList()
    if (index > 0) nodes.push(createElement('br', { key: `br-${key++}` }))
    nodes.push(...parseInline(line, `line-${key++}`))
  })
  flushList()

  return createElement(Fragment, null, ...nodes)
}

const INLINE_PATTERN = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const match = INLINE_PATTERN.exec(remaining)
    if (!match) {
      nodes.push(remaining)
      break
    }

    const index = match.index
    if (index > 0) {
      nodes.push(remaining.slice(0, index))
    }

    if (match[1] !== undefined) {
      nodes.push(createElement('strong', { key: `${keyPrefix}-${key++}` }, match[1]))
    } else {
      const content = match[2] ?? match[3]
      nodes.push(createElement('em', { key: `${keyPrefix}-${key++}` }, content))
    }

    remaining = remaining.slice(index + match[0].length)
  }

  return nodes
}
