import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { renderMarkdownLite } from './markdownLite'

const ALLOWED_TAGS = new Set(['STRONG', 'EM', 'UL', 'LI', 'BR', 'DIV'])

function renderLite(raw: string) {
  const { container } = render(<div data-testid="output">{renderMarkdownLite(raw)}</div>)
  return container
}

describe('renderMarkdownLite — formatting', () => {
  it('renders **bold** as <strong>', () => {
    const container = renderLite('**bold**')
    expect(container.querySelector('strong')?.textContent).toBe('bold')
  })

  it('renders *italic* and _italic_ as <em>', () => {
    const container = renderLite('*one* and _two_')
    const em = container.querySelectorAll('em')
    expect(em).toHaveLength(2)
    expect(em[0].textContent).toBe('one')
    expect(em[1].textContent).toBe('two')
  })

  it('renders consecutive "- " lines as a single <ul> of <li>', () => {
    const container = renderLite('- first\n- second\n- third')
    const list = container.querySelector('ul')
    const items = container.querySelectorAll('li')
    expect(list).not.toBeNull()
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('first')
    expect(items[2].textContent).toBe('third')
  })

  it('supports "* " as an alternate bullet marker', () => {
    const container = renderLite('* alpha\n* beta')
    expect(container.querySelectorAll('li')).toHaveLength(2)
  })

  it('joins non-list lines with <br>', () => {
    const container = renderLite('line one\nline two')
    expect(container.querySelectorAll('br')).toHaveLength(1)
    expect(container.textContent).toBe('line oneline two')
  })

  it('renders bold/italic inside list items', () => {
    const container = renderLite('- **Led** a *great* team')
    const item = container.querySelector('li')
    expect(item?.querySelector('strong')?.textContent).toBe('Led')
    expect(item?.querySelector('em')?.textContent).toBe('great')
  })

  it('leaves unmatched markers as literal text', () => {
    const container = renderLite('this ** is not bold')
    expect(container.querySelector('strong')).toBeNull()
    expect(container.textContent).toBe('this ** is not bold')
  })
})

describe('renderMarkdownLite — XSS safety (Security doc §4.1)', () => {
  it('renders a <script> tag attempt as inert plain text, not an executable element', () => {
    const container = renderLite('<script>window.__xss = true</script>')

    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toBe('<script>window.__xss = true</script>')
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
  })

  it('renders an <img onerror=...> attempt as inert plain text, not an <img> element', () => {
    const container = renderLite('<img src=x onerror="window.__xss = true">')

    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('onerror="window.__xss = true"')
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
  })

  it('renders a javascript: URI as inert plain text — no anchor is ever created', () => {
    const container = renderLite('[click me](javascript:alert(1))')

    expect(container.querySelector('a')).toBeNull()
    expect(container.textContent).toBe('[click me](javascript:alert(1))')
  })

  it('renders an onmouseover attribute-injection attempt as inert plain text', () => {
    const container = renderLite('**bold** <div onmouseover="alert(1)">text</div>')

    const strong = container.querySelector('strong')
    expect(strong?.textContent).toBe('bold')
    expect(container.textContent).toContain('<div onmouseover="alert(1)">text</div>')
  })

  it('never emits any element outside the whitelist, even for adversarial input', () => {
    const adversarial = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<a href="javascript:alert(1)">link</a>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '**bold** <svg onload=alert(1)>',
      '- <b>not bold via raw html</b>',
    ].join('\n')

    const container = renderLite(adversarial)
    const allElements = container.querySelectorAll('*')

    for (const element of Array.from(allElements)) {
      expect(ALLOWED_TAGS.has(element.tagName)).toBe(true)
      // whitelisted elements must carry no attributes at all (no href, src, onerror, etc.)
      if (element.tagName !== 'DIV') {
        expect(element.attributes.length).toBe(0)
      }
    }
  })
})
