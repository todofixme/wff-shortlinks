export const CONFIG = {
  BASE_URL: 'https://wff-berlin.de',
  SHORT_URL_BASE: import.meta.env.VITE_SHORT_URL_BASE || 'https://s.wff-berlin.de',
  UTM_SOURCES: [
    {value: 'email', label: 'E-Mail Newsletter'},
    {value: 'mail', label: 'postalischer Brief'},
    {value: 'ert', label: 'ERT Website'},
    {value: 'strava', label: 'Strava'},
    {value: 'whatsapp', label: 'WhatsApp'},
    {value: 'instagram', label: 'Instagram'},
    {value: 'facebook', label: 'Facebook'},
  ] as const,
} as const

export type UtmSourceValue = typeof CONFIG.UTM_SOURCES[number]['value'];

type UrlPattern = {
  name: string;
  matcher: (params: URLSearchParams) => boolean;
  pathGenerator: (params: URLSearchParams) => string;
}

// php-style urlencode() to use '+' instead of '%20'
const phpUrlEncode = (str: string) => {
  return encodeURIComponent(str).replace(/%20/g, '+')
}

const URL_PATTERNS: UrlPattern[] = [
  {
    name: 'news',
    matcher: (params) => params.get('action') === 'start_news' && params.get('cmd') === 'view' && params.has('id'),
    pathGenerator: (params) => `/n/${params.get('id')}`
  },
  {
    name: 'veranstaltung',
    matcher: (params) => params.has('veranstaltung') && params.get('veranstaltung') !== '',
    pathGenerator: (params) => `/v/${encodeURIComponent(params.get('veranstaltung') || '')}`
  },
  {
    name: 'veranstaltung-anmelden',
    matcher: (params) => params.has('veranstaltunganmelden') && params.get('veranstaltunganmelden') !== '',
    pathGenerator: (params) => `/va/${encodeURIComponent(params.get('veranstaltunganmelden') || '')}`
  },
  {
    name: 'event-anmelden',
    matcher: (params) => params.get('action') === 'events_anmeldungen' && params.has('id') && params.get('id') !== '',
    pathGenerator: (params) => `/ea/${encodeURIComponent(params.get('id') || '')}`
  },
  {
    name: 'newsletter',
    matcher: (params) => params.has('newsletter') && !params.has('artikel'),
    pathGenerator: (params) => `/nl/${encodeURIComponent(params.get('newsletter') || '')}`
  },
  {
    name: 'article',
    matcher: (params) => params.has('artikel') && !params.has('newsletter'),
    pathGenerator: (params) => `/a/${encodeURIComponent(params.get('artikel') || '')}`
  },
  {
    name: 'newsletter-article',
    matcher: (params) => params.has('newsletter') && params.has('artikel'),
    pathGenerator: (params) => `/a/${encodeURIComponent(params.get('artikel') || '')}/nl/${encodeURIComponent(params.get('newsletter') || '')}`
  },
  {
    name: 'downloads',
    matcher: (params) => params.get('action') === 'data_raum' && params.has('id') && params.has('download'),
    pathGenerator: (params) => {
      const id = params.get('id')
      const download = params.get('download') || ''
      return `/dr/${id}/dl/${phpUrlEncode(download)}`
    }
  },
]

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith(CONFIG.BASE_URL)
  } catch {
    return false
  }
}

export type GenerateResult = {
  result: string | null;
  error: string | null;
}

export const generateShortUrl = (longUrl: string, source: string, campaign: string): GenerateResult => {
  if (!longUrl.trim()) return {result: null, error: null}

  if (!validateUrl(longUrl)) {
    return {
      result: null,
      error: `Die URL muss eine gültige URL sein und mit ${CONFIG.BASE_URL} beginnen.`
    }
  }

  try {
    const urlObj = new URL(longUrl)
    const params = urlObj.searchParams

    const pattern = URL_PATTERNS.find(p => p.matcher(params))
    if (!pattern) {
      return {result: null, error: 'Kein bekanntes URL-Muster erkannt.'}
    }

    let path = pattern.pathGenerator(params)

    // UTM-Parameter
    if (source && source !== 'none') {
      const validSource = CONFIG.UTM_SOURCES.find(s => s.value === source)
      if (validSource) {
        path += `/s/${source}`
      }
    }

    if (campaign) {
      path += `/c/${encodeURIComponent(campaign)}`
    }

    return {result: `${CONFIG.SHORT_URL_BASE}${path}`, error: null}

  } catch {
    return {result: null, error: 'Ungültiges URL-Format.'}
  }
}
