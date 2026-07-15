import { describe, it, expect } from 'vitest'
import { validateImportPayload, readAndValidateImportFile } from './validateImport'
import { fullTestResume, testSettings } from '../components/templates/testFixtures'

function validSingleResumePayload() {
  return {
    kind: 'single-resume',
    schemaVersion: 1,
    resume: fullTestResume,
    settings: testSettings,
  }
}

function validAppDataPayload() {
  return {
    kind: 'app-data',
    schemaVersion: 1,
    resumes: [fullTestResume],
    activeResumeId: fullTestResume.id,
    settings: { [fullTestResume.id]: testSettings },
  }
}

describe('validateImportPayload — valid input', () => {
  it('accepts a valid single-resume payload', () => {
    const result = validateImportPayload(validSingleResumePayload())
    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data.kind).toBe('single-resume')
      if (result.data.kind === 'single-resume') {
        expect(result.data.resume.personalInfo.fullName).toBe('Jane Doe')
        expect(result.data.settings.accentColor).toBe('#2456A6')
      }
    }
  })

  it('accepts a valid app-data payload', () => {
    const result = validateImportPayload(validAppDataPayload())
    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data.kind).toBe('app-data')
      if (result.data.kind === 'app-data') {
        expect(result.data.resumes).toHaveLength(1)
        expect(result.data.activeResumeId).toBe(fullTestResume.id)
      }
    }
  })

  it('falls back to the first resume when activeResumeId does not match any resume', () => {
    const payload = { ...validAppDataPayload(), activeResumeId: 'nonexistent-id' }
    const result = validateImportPayload(payload)
    expect('data' in result).toBe(true)
    if ('data' in result && result.data.kind === 'app-data') {
      expect(result.data.activeResumeId).toBe(fullTestResume.id)
    }
  })

  it('strips unknown/extra keys from every level of the object', () => {
    const payload = {
      ...validSingleResumePayload(),
      maliciousTopLevelKey: 'should be stripped',
      resume: {
        ...fullTestResume,
        maliciousResumeKey: 'should be stripped',
        personalInfo: { ...fullTestResume.personalInfo, extraField: 'should be stripped' },
      },
    }
    const result = validateImportPayload(payload)
    expect('data' in result).toBe(true)
    if ('data' in result && result.data.kind === 'single-resume') {
      expect(result.data).not.toHaveProperty('maliciousTopLevelKey')
      expect(result.data.resume).not.toHaveProperty('maliciousResumeKey')
      expect(result.data.resume.personalInfo).not.toHaveProperty('extraField')
    }
  })
})

describe('validateImportPayload — malformed / hostile input', () => {
  it('rejects non-object top-level values', () => {
    for (const bad of [null, undefined, 'a string', 42, true, [], []]) {
      const result = validateImportPayload(bad)
      expect('error' in result).toBe(true)
    }
  })

  it('rejects a missing or invalid schemaVersion', () => {
    const payload: Record<string, unknown> = { ...validSingleResumePayload() }
    delete payload.schemaVersion
    expect('error' in validateImportPayload(payload)).toBe(true)
    expect(
      'error' in validateImportPayload({ ...validSingleResumePayload(), schemaVersion: 'one' }),
    ).toBe(true)
  })

  it('rejects an unrecognized kind', () => {
    const result = validateImportPayload({ ...validSingleResumePayload(), kind: 'evil-payload' })
    expect('error' in result).toBe(true)
  })

  it('rejects a resume missing required string fields', () => {
    const payload = {
      ...validSingleResumePayload(),
      resume: { ...fullTestResume, id: undefined },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects a resume with a malformed personalInfo', () => {
    const payload = {
      ...validSingleResumePayload(),
      resume: { ...fullTestResume, personalInfo: { fullName: 123 } },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects a resume with a malformed entry (wrong type field)', () => {
    const payload = {
      ...validSingleResumePayload(),
      resume: {
        ...fullTestResume,
        sections: [
          {
            id: 's1',
            type: 'experience',
            title: 'Experience',
            visible: true,
            entries: [{ id: 'e1', type: 'not-a-real-type' }],
          },
        ],
      },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects a section with an entry missing required fields', () => {
    const payload = {
      ...validSingleResumePayload(),
      resume: {
        ...fullTestResume,
        sections: [
          {
            id: 's1',
            type: 'experience',
            title: 'Experience',
            visible: true,
            entries: [{ id: 'e1', type: 'experience', company: 'Acme' }], // missing role, startDate, etc.
          },
        ],
      },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects a section with an unrecognized section type', () => {
    const payload = {
      ...validSingleResumePayload(),
      resume: {
        ...fullTestResume,
        sections: [{ id: 's1', type: 'malicious-type', title: 'X', visible: true, entries: [] }],
      },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects settings with an out-of-enum templateId', () => {
    const payload = {
      ...validSingleResumePayload(),
      settings: { ...testSettings, templateId: 'evil-template' },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects settings with an out-of-enum fontScale', () => {
    const payload = {
      ...validSingleResumePayload(),
      settings: { ...testSettings, fontScale: 'xl' },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects settings with non-numeric spacing fields', () => {
    const payload = {
      ...validSingleResumePayload(),
      settings: { ...testSettings, lineSpacing: '1.4' },
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects an app-data payload with an empty resumes array', () => {
    const payload = { ...validAppDataPayload(), resumes: [] }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects an app-data payload where resumes is not an array', () => {
    const payload = { ...validAppDataPayload(), resumes: 'not-an-array' }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('rejects an app-data payload with malformed settings', () => {
    const payload = {
      ...validAppDataPayload(),
      settings: { [fullTestResume.id]: { templateId: 'classic' } }, // missing required fields
    }
    expect('error' in validateImportPayload(payload)).toBe(true)
  })

  it('does not crash and does not pollute the prototype on a __proto__ injection attempt', () => {
    const hostile = JSON.parse(
      '{"kind":"single-resume","schemaVersion":1,"resume":{"__proto__":{"polluted":true}},"settings":{}}',
    )
    const result = validateImportPayload(hostile)
    expect('error' in result).toBe(true)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.getPrototypeOf({})).toBe(Object.prototype)
  })

  it('never executes arbitrary code embedded as a string value', () => {
    const payload = {
      ...validSingleResumePayload(),
      resume: {
        ...fullTestResume,
        name: '"; global.__pwned = true; //',
      },
    }
    const result = validateImportPayload(payload)
    expect('data' in result).toBe(true)
    expect((globalThis as Record<string, unknown>).__pwned).toBeUndefined()
  })
})

describe('readAndValidateImportFile', () => {
  it('accepts a valid file', async () => {
    const file = new File([JSON.stringify(validSingleResumePayload())], 'resume.json', {
      type: 'application/json',
    })
    const result = await readAndValidateImportFile(file)
    expect('data' in result).toBe(true)
  })

  it('rejects an empty file', async () => {
    const file = new File([''], 'empty.json', { type: 'application/json' })
    const result = await readAndValidateImportFile(file)
    expect('error' in result).toBe(true)
  })

  it('rejects a file over the 2 MB size limit', async () => {
    const oversized = 'a'.repeat(2 * 1024 * 1024 + 1)
    const file = new File([oversized], 'huge.json', { type: 'application/json' })
    const result = await readAndValidateImportFile(file)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.error).toMatch(/too large/i)
  })

  it('rejects a file that is not valid JSON', async () => {
    const file = new File(['{ this is not json'], 'bad.json', { type: 'application/json' })
    const result = await readAndValidateImportFile(file)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.error).toMatch(/not valid json/i)
  })

  it('rejects valid JSON that fails schema validation, with a clear error', async () => {
    const file = new File([JSON.stringify({ hello: 'world' })], 'wrong-shape.json', {
      type: 'application/json',
    })
    const result = await readAndValidateImportFile(file)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.error.length).toBeGreaterThan(0)
  })
})
