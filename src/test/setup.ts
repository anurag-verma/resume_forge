import '@testing-library/jest-dom'

// jsdom doesn't implement <dialog> interactivity yet; polyfill the two
// methods ConfirmDialog relies on so tests can exercise open/close.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

// jsdom doesn't implement ResizeObserver at all; a no-op stub is enough for
// components (PreviewPane, PagedDocument) that only need the initial,
// synchronous measurement to run without throwing.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't implement Blob/File.prototype.text() yet, but FileReader
// (which it does support) gives the same result.
if (typeof File !== 'undefined' && !File.prototype.text) {
  File.prototype.text = function (this: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(this)
    })
  }
}
