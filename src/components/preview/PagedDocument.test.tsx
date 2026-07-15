import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PagedDocument } from './PagedDocument'
import { PAGE_HEIGHT_PX } from '../../lib/pagination'

/** Simulates the content wrapper having a real, measured height in the browser. */
function mockScrollHeight(px: number) {
  vi.spyOn(HTMLDivElement.prototype, 'scrollHeight', 'get').mockReturnValue(px)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PagedDocument', () => {
  it('shows no page-break lines when content fits on one page', () => {
    mockScrollHeight(200)
    render(
      <PagedDocument>
        <p>Short content</p>
      </PagedDocument>,
    )

    expect(screen.queryAllByTestId('page-break')).toHaveLength(0)
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
  })

  it('shows a page-break line and "Page 2" label once content overflows one page', () => {
    mockScrollHeight(PAGE_HEIGHT_PX + 100)
    render(
      <PagedDocument>
        <p>Long content</p>
      </PagedDocument>,
    )

    expect(screen.getAllByTestId('page-break')).toHaveLength(1)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('shows multiple page-break lines for content spanning several pages', () => {
    mockScrollHeight(PAGE_HEIGHT_PX * 2 + 50)
    render(
      <PagedDocument>
        <p>Very long content</p>
      </PagedDocument>,
    )

    expect(screen.getAllByTestId('page-break')).toHaveLength(2)
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
  })

  it('renders the given children', () => {
    mockScrollHeight(100)
    render(
      <PagedDocument>
        <p>Resume content goes here</p>
      </PagedDocument>,
    )

    expect(screen.getByText('Resume content goes here')).toBeInTheDocument()
  })
})
