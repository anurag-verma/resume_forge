import { describe, it, expect, vi, afterEach } from 'vitest'
import { downloadJsonFile } from './download'

describe('downloadJsonFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('creates a blob URL, clicks a temporary anchor, and revokes the URL', () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:mock-url')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    downloadJsonFile('test.json', { hello: 'world' })

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(createObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob)
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('sets the anchor download attribute to the given filename', () => {
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
    let capturedFilename = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      capturedFilename = this.download
    })

    downloadJsonFile('my-resume.json', { a: 1 })

    expect(capturedFilename).toBe('my-resume.json')
  })
})
