import {describe, expect, it} from 'vitest'
import {CONFIG, generateShortUrl} from './shortener'

describe('generateShortUrl', () => {
  const BASE = CONFIG.BASE_URL
  const SHORT_BASE = CONFIG.SHORT_URL_BASE

  it('returns null for empty input', () => {
    expect(generateShortUrl('', '', '')).toEqual({result: null, error: null})
    expect(generateShortUrl('   ', '', '')).toEqual({result: null, error: null})
  })

  it('detects invalid domains', () => {
    const {result, error} = generateShortUrl('https://google.com?newsletter=1', '', '')
    expect(result).toBeNull()
    expect(error).toContain(`muss eine gültige URL sein und mit ${BASE} beginnen`)
  })

  it('detects URL without matching pattern', () => {
    const {result, error} = generateShortUrl(`${BASE}?unknown=1`, '', '')
    expect(result).toBeNull()
    expect(error).toBe('Kein bekanntes URL-Muster erkannt.')
  })

  describe('URL Patterns', () => {
    it('News', () => {
      const url = `${BASE}?action=start_news&cmd=view&id=123`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/n/123`)
    })

    it('Veranstaltung', () => {
      const url = `${BASE}?veranstaltung=123`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/v/123`)
    })

    it('Veranstaltung anmelden', () => {
      const url = `${BASE}?veranstaltunganmelden=123`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/va/123`)
    })

    it('Event anmelden', () => {
      const url = `${BASE}?action=events_anmeldungen&id=123`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/ea/123`)
    })

    it('Newsletter', () => {
      const url = `${BASE}?newsletter=456`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/nl/456`)
    })

    it('Article', () => {
      const url = `${BASE}?artikel=789`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/a/789`)
    })

    it('Newsletter with article', () => {
      const url = `${BASE}?newsletter=456&artikel=789`
      const {result} = generateShortUrl(url, '', '')
      expect(result).toBe(`${SHORT_BASE}/a/789/nl/456`)
    })

    it('Downloads (with PHP encoding check)', () => {
      // testing phpUrlEncode behaviour (whitespace -> +)
      const url = `${BASE}?action=data_raum&id=345&download=Test-Protokoll+Versammlung+2025-06-11.pdf`
      const {result} = generateShortUrl(url, '', '')
      // Expected: /dr/99/dl/Mein+Dokument.pdf (not %20)
      expect(result).toBe(`${SHORT_BASE}/dr/345/dl/Test-Protokoll+Versammlung+2025-06-11.pdf`)
    })
  })

  describe('UTM Parameters', () => {
    const validUrl = `${BASE}?veranstaltung=123`

    CONFIG.UTM_SOURCES.forEach((source) => {
      it(`adds source: ${source.value}`, () => {
        const {result} = generateShortUrl(validUrl, source.value, '')
        expect(result).toBe(`${SHORT_BASE}/v/123/s/${source.value}`)
      })
    })

    it('ignores invalid source', () => {
      const {result} = generateShortUrl(validUrl, 'invalid_source', '')
      expect(result).toBe(`${SHORT_BASE}/v/123`)
    })

    it('adds campaign', () => {
      const {result} = generateShortUrl(validUrl, '', 'nl2512')
      expect(result).toBe(`${SHORT_BASE}/v/123/c/nl2512`)
    })

    it('encodes campaign correctly', () => {
      const {result} = generateShortUrl(validUrl, '', 'nl2512')
      expect(result).toBe(`${SHORT_BASE}/v/123/c/nl2512`)
    })

    it('combines source and campaign', () => {
      const {result} = generateShortUrl(validUrl, 'email', 'nl2025')
      expect(result).toBe(`${SHORT_BASE}/v/123/s/email/c/nl2025`)
    })
  })
})
